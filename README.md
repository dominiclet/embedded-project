# Inventory Management System

## Frontend

The frontend web application is currently hosted at https://fluffy-biscotti-b62ab7.netlify.app/. To use the frontend web page with a running backend server, open the console in the browser developer tools and type the following command:

```
document.BASE_URL = "<BACKEND_BASE_URL>";
```

where <BACKEND_BASE_URL> is the URL of the backend server. Ensure that the backend server is accessible by your computer.

If you would like to run the development frontend server instead, `cd` into the `frontend` directory and run:

```
npm run dev
```

## Backend



### RaspberryPi Setup

The RaspberryP 4B connected with a MFRC522 RFID reader will be the backend device that receives the card data.

A. You may setup RaspberryPi with Head or Headless. In this project, the headless method is used with USB OTG (connect to Pi via USB)

1. Follow this steps to install RPi OS. (Please include the WIFI credentials and enable SSH for the RPi to connect at startup)
    https://www.raspberrypi.com/documentation/computers/getting-started.html#raspberry-pi-imager

2. With your SD Card connected to your PC, do the following to enable the USB OTG.

    i. Append line to config.txt.

        dtoverlay=dwc2
    IF otg_mode=1 contains in this file, comment it out using #.
        
    ii. Append the following to cmdline.txt after rootwait.

        module-load=dwc2,g_ether
    Example of cmdline.txt after edit

        console=serial0,115200 console=tty1 root=PARTUUID=34f4435e-02 rootfstype=ext4 fsck.repair=yes rootwait modules-load=dwc2,g_ether quiet init=/usr/lib/raspberrypi-sys-mods/firstboot systemd.run=/boot/firstrun.sh systemd.run_success_action=reboot systemd.unit=kernel-command-line.target

    iii. Insert SD card to RPi and boot with Type C
        
    iv. In SSH mode on PC, 

        ssh <username>@raspberrypi.local 
    < username > is username that is set during installation of the OS.


B. Once setup of RPi is done, set up the MFRC522 RFID reader.

1. Connect the reader accordingly:
    https://pimylifeup.com/raspberry-pi-rfid-rc522/
    
2. Clone MFRC522-Python and install accordignly:

        git clone https://github.com/pimylifeup/MFRC522-python.git

3. Update backend/inventory.py
    
        BASE_URL = <BACKEND_BASE_URL>
    where <BACKEND_BASE_URL> is the URL of the backend server. Ensure that the backend server is accessible by your computer.

4. In your desired folder or in the backend folder, run inventory.py
        
        python3 inventory.py

5. Tap the RFID card to check if the reader is able to read the UID of the card.
