from typing import Annotated

from fastapi import Depends, FastAPI, HTTPException, Query
from typing import List, Optional
from sqlmodel import Field, Session, SQLModel, create_engine, select
from sqlmodel import SQLModel, Field, Relationship
from sqlalchemy.orm import selectinload
from fastapi import HTTPException, status

# Pydantic(requests and response) models
class ShelfBase(SQLModel):
    shelfId: str
    location: str

class ShelfRegister(ShelfBase):
    pass  # No additional logic needed for now

class ProductAdd(SQLModel):
    productId: str

# Pydantic for front end
class ProductRead(SQLModel):
    productId: str
    type: str
    price: float

class ShelfReadWithProducts(SQLModel):
    shelfId: str
    location: str
    products: List[ProductRead] = []

# Data tables for sqlite database
class Shelf(SQLModel, table=True):
    shelfId: str | None = Field(default=None, primary_key=True, nullable=False) # Shelf id is actually rfid / rpi id
    location: str = Field(index=True, unique=True)
    products: list["Product"] = Relationship(back_populates="shelf") # one to many relationship to products

class Product(SQLModel, table=True):
    productId: str = Field(default=None, primary_key=True, nullable=False)  # Product id (primary key)
    type: str # e.g coke
    price: float
    shelfId: str = Field(foreign_key="shelf.shelfId", nullable=True)  # Foreign key referring to Shelf
    shelf: Shelf = Relationship(back_populates="products")  # Establishing reverse relationship


sqlite_file_name = "database.db"
sqlite_url = f"sqlite:///{sqlite_file_name}"

connect_args = {"check_same_thread": False}
engine = create_engine(sqlite_url, connect_args=connect_args)


def create_db_and_tables():
    SQLModel.metadata.create_all(engine)


def generate_default_data():
    with Session(engine) as session:
        # Check if products exist, if not, create default products that id is linked to actual tag id
        if not session.exec(select(Product)).first():
            default_products = [
                Product(productId="P1", type="Coke", price=1.99),
                Product(productId="P2", type="Pepsi", price=1.89),
                Product(productId="P3", type="Sprite", price=1.79),
            ]
            session.add_all(default_products)
            session.commit()


def get_session():
    with Session(engine) as session:
        yield session


SessionDep = Annotated[Session, Depends(get_session)]

app = FastAPI()

@app.on_event("startup")
def on_startup():
    create_db_and_tables()
    generate_default_data()

# session is for accessing database
@app.post("/shelves/")
def register_shelf(shelf: ShelfRegister, session: SessionDep) -> Shelf:
    existing_shelf = session.exec(select(Shelf).where(Shelf.shelfId == shelf.shelfId)).first()
    
    # If shelf exists, just return sucess
    if existing_shelf:
        return {"message": "success"}
    
    new_shelf = Shelf(shelfId = shelf.shelfId, location=shelf.location)
    session.add(new_shelf)
    session.commit()
    session.refresh(new_shelf)
    return {"message": "success"}

@app.patch("/shelves/{shelf_id}")
def add_products_to_shelf(shelf_id: str, product: ProductAdd, session: SessionDep):

    # Get shelf
    shelf = session.exec(select(Shelf).where(Shelf.shelfId == shelf_id)).first()
    
    # If shelf doesn't exist, return a 404 error. Shouldn't happen
    if not shelf:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Shelf not found")
    
    # Check if product exists
    product = session.exec(
            select(Product).where(Product.productId == product.productId)
        ).first()
    
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

    if product.shelfId != None and product.shelfId != shelf_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Product can not exist on two shelves")
    
    if product.shelfId == shelf_id:
        # unlink product from shelf
        product.shelfId = None
    else:
        product.shelfId = shelf_id
    
    session.commit()
    return {"message": "success"}


# Frontend api
@app.get("/shelves/")
def get_all_shelves(session: SessionDep):
    shelves = session.exec(
        select(Shelf).options(selectinload(Shelf.products))
    ).all()
    
    # Convert the result to ShelfReadWithProducts to include products
    shelves_with_products = []
    for shelf in shelves:
        shelves_with_products.append(ShelfReadWithProducts(
            shelfId=shelf.shelfId,
            location=shelf.location,
            products=[ProductRead(productId=product.productId, type=product.type, price=product.price) for product in shelf.products]
        ))
    
    return {"shelves": shelves_with_products}
    
@app.get("/products/", response_model=List[ProductRead])
def get_all_products(session: SessionDep):
    products = session.exec(select(Product)).all()
    return products

@app.post("/shelves/{shelf_id}/restart")
def restart_shelf(shelf_id: str, session: SessionDep):
    # Fetch the shelf by shelf_id
    shelf = session.exec(select(Shelf).where(Shelf.shelfId == shelf_id)).first()
    
    if not shelf:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Shelf not found")
    
    # Fetch all products linked to this shelf
    products = session.exec(select(Product).where(Product.shelfId == shelf_id)).all()

    # Unlink all products from the shelf
    for product in products:
        product.shelfId = None  # Set the shelfId to None
    
    session.commit()  # Commit the changes to the database
    
    return {"status": f"completed"}