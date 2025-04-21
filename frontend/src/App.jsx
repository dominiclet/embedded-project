import './App.css'


import { useEffect, useState } from 'react';
import { Package, Trash2, Edit, Save, Plus, Search } from 'lucide-react';

export default function InventoryManagementSystem() {
    // Sample initial inventory data
    const initialInventory = [
        {
            shelfId: 1,
            location: "Aisle 1",
            products: [
                { productId: 101, type: "Computing", price: 999.99 },
                { productId: 102, type: "Mobile", price: 699.99 },
                { productId: 103, type: "Tablet", price: 349.99 },
            ]
        },
        {
            shelfId: 2,
            location: "Aisle 2",
            products: [
                { productId: 201, type: "Paper Goods", price: 4.99 },
                { productId: 202, type: "Writing Instruments", price: 9.99 },
                { productId: 203, type: "Desk Accessories", price: 8.50 },
                { productId: 204, type: "Stationery", price: 5.99 },
            ]
        },
        {
            shelfId: 3,
            location: "Aisle 3",
            products: [
                { productId: 301, type: "Drinkware", price: 7.99 },
                { productId: 302, type: "Cutting Tools", price: 19.99 },
                { productId: 303, type: "Cookware", price: 89.99 },
            ]
        }
    ];

    useEffect(() => {
        setInterval(async () => {
            if (!document.BASE_URL) {
                console.error("document.BASE_URL is not set");
                return;
            }
            try {
                const resp = await fetch(`${document.BASE_URL}/shelves`, { method: 'GET', headers: { "ngrok-skip-browser-warning": "1" } });
                const data = await resp.json();
                setInventory(data.shelves);
            } catch (e) {
                console.error(e);
            }
        }, 1000);

        const alarmsStr = localStorage.getItem("alarms");
        if (!alarmsStr) {
            return;
        }
        setAlarms(JSON.parse(alarmsStr));
    }, []);


    const [alarms, setAlarms] = useState([]);
    const [inventory, setInventory] = useState([]);
    const [isAddingAlarm, setIsAddingAlarm] = useState(false);
    const [alerts, setAlerts] = useState([]);

    // Check for alarms to generate alerts
    useEffect(() => {
        const newAlerts = [];
        alarms.forEach(alarm => {
            let qty = 0;
            inventory.forEach(shelf => {
                qty += shelf.products.filter(product => product.type === alarm.prodType).length;
            });
            if (qty <= alarm.qty) {
                newAlerts.push(alarm.prodType);
            }
        });
        setAlerts(newAlerts);
    }, [alarms, inventory])

    console.log(alerts)

    //const addNewProduct = () => {
    //    if (newProduct.shelfId && newProduct.id && newProduct.type && newProduct.price >= 0) {
    //        // Check if the ID already exists in the target shelf
    //        const targetShelf = inventory.find(shelf => shelf.id === parseInt(newProduct.shelfId));
    //
    //        if (targetShelf) {
    //            const idExists = targetShelf.products.some(p => p.id === parseInt(newProduct.id));
    //
    //            if (idExists) {
    //                alert("A product with this ID already exists on this shelf. Please choose a different ID.");
    //                return;
    //            }
    //
    //            const newProductObj = {
    //                id: parseInt(newProduct.id),
    //                type: newProduct.type,
    //                price: newProduct.price
    //            };
    //
    //            setInventory(inventory.map(shelf => {
    //                if (shelf.id === parseInt(newProduct.shelfId)) {
    //                    return {
    //                        ...shelf,
    //                        products: [...shelf.products, newProductObj]
    //                    };
    //                }
    //                return shelf;
    //            }));
    //
    //            setNewProduct({
    //                shelfId: "",
    //                id: "",
    //                type: "",
    //                price: 0
    //            });
    //            setIsAddingProduct(false);
    //        }
    //    }
    //};

    return (
        <div className="bg-gray-100 min-h-screen p-6">
            <div className="max-w-6xl mx-auto">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">Inventory Management System</h1>
                    {alerts.length > 0 && (
                        <div className="bg-red-600 text-white px-6 py-4 mb-5 flex flex-col items-start">
                            <h2 className="text-xl font-semibold">Alerts</h2>
                            {alerts.map(alert => (
                                <div className="w-full">
                                    {`Stock for ${alert} is running low!`}
                                </div>
                            ))}
                        </div>
                    )}
                    <div className="flex justify-between items-center">
                        <button
                            className="bg-blue hover:bg-blue-700 text-black px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                            onClick={() => setIsAddingAlarm(true)}
                        >
                            <Plus className="h-5 w-5" />
                            Add Alarm
                        </button>
                    </div>
                </header>

                {isAddingAlarm && (
                    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                        <h2 className="text-xl font-semibold mb-4">Current alarms</h2>
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Type
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Threshold Quantity
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {alarms.map(alarm => (
                                    <tr key={alarm.prodType}>
                                        <>
                                            <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                                                {alarm.prodType}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                                                {alarm.qty}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                                                <button onClick={() => {
                                                    const updatedAlarms = alarms.filter(a => a.prodType !== alarm.prodType);
                                                    setAlarms(updatedAlarms);
                                                    localStorage.setItem("alarms", JSON.stringify(updatedAlarms));
                                                }}>Delete</button>
                                            </td>
                                        </>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <h2 className="text-xl font-semibold mb-4">Add new alarm</h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Product Type</label>
                                <input
                                    className="w-full p-2 border border-gray-300 rounded-md"
                                    id="prod-type"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Threshold Quantity</label>
                                <input
                                    type="number"
                                    className="w-full p-2 border border-gray-300 rounded-md"
                                    min="0"
                                    id="qty"
                                />
                            </div>
                        </div>
                        <div className="mt-4 flex justify-end gap-2">
                            <button
                                className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg transition-colors"
                                onClick={() => setIsAddingAlarm(false)}
                            >
                                Cancel
                            </button>
                            <button
                                style={{background: "blue"}}
                                className="text-white px-4 py-2 text-gray-800 rounded-lg flex items-center gap-2"
                                onClick={() => {
                                    const prodType = document.getElementById("prod-type").value;
                                    const qty = document.getElementById("qty").value;
                                    if (!prodType || !qty) {
                                        return;
                                    }
                                    const newAlarms = alarms.concat([{
                                        prodType: prodType,
                                        qty: qty,
                                    }]);
                                    localStorage.setItem("alarms", JSON.stringify(newAlarms));
                                    setAlarms(newAlarms);
                                    setIsAddingAlarm(false);
                                }}
                            >
                                <Save className="h-5 w-5" />
                                Add Alarm
                            </button>
                        </div>
                    </div>
                )}

                {inventory && 
                    <>
                        <div className="space-y-6">
                            {inventory.map(shelf => (
                                <div key={shelf.shelfId} className="bg-white rounded-lg shadow-md overflow-hidden">
                                    <div className="bg-blue-600 text-white px-6 py-4 flex items-center">
                                        <Package className="h-6 w-6 mr-2" />
                                        <h2 className="text-xl font-semibold">{`${shelf.location} (${shelf.shelfId})`}</h2>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Product ID
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Type
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Price
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200">
                                                {shelf.products.map(product => (
                                                    <tr key={product.productId}>
                                                        <>
                                                            <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                                                                {product.productId}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                                                                {product.type}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                                                                ${product.price.toFixed(2)}
                                                            </td>
                                                        </>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {inventory.length === 0 && (
                            <div className="bg-white rounded-lg shadow-md p-6 text-center">
                                <p className="text-lg text-gray-600">No products found.</p>
                            </div>
                        )}
                    </>
                }

            </div>
        </div>
    );
}
