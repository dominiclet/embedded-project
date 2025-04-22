#!/usr/bin/env python

import RPi.GPIO as GPIO
from mfrc522 import SimpleMFRC522
import sys
import requests
import time

shelf_id = "12345"
location = "Aisle 3"
BASE_URL = "https://9086-115-66-245-165.ngrok-free.app"

def readItem(shelf_id):
    while True:
        try:
            reader = SimpleMFRC522()
            uid = reader.read_id()
            print("UID:"+str(uid))
            product_event(shelf_id, str(uid))
            #sleep(0.5)
        finally:
            GPIO.cleanup()


def product_event(shelf_id, product_id):
    retry = 5
    count = 0
    while True:
        if count >= 5:
            break
        data = {
            "productId": product_id
        }
        req_url = f"{BASE_URL}/shelves/{shelf_id}"
        response = requests.patch(req_url, json=data)
        if response.status_code == 200:
            print(f"Successfully registered item: {product_id}")
            break
        count += 1

if __name__ == "__main__":
    
    GPIO.cleanup()
    
    if len(sys.argv) < 2:
        shelf_data = {
            "shelfId": shelf_id,
            "location": location
        } 
    else:
        shelf_data = {
            "shelfId": sys.argv[1],
            "location": sys.argv[2]
        } 

    # Set up python code
    response = requests.post(BASE_URL+"/shelves", json=shelf_data, verify=False)
    if response.ok:
        # response success can carry on
        print("Registered shelf", response.json())
    
    readItem(shelf_data["shelfId"])