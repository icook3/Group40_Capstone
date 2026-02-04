# Downloading Zlow

To run Zlow, first you will need to download the code for it: 

1. Download and install git at https://git-scm.com
    - Get the most recent version (x64).
    - The default installer settings work fine here.
    - To can check that you have it installed, type ```git -v``` in the terminal/comand line. 
    - To access the terminal/command line: 
        - On Windows 11, hold shift, right-click on a folder area in Windows explorer, and select "Open in Terminal". 
        - On Windows 10, hold shift, right-click on a folder area in Windows explorer, and select "open PowerShell window here". 
2. In the file explorer, go to the folder you want to download Zlow to, and open the command line in it.
3. In the command line, enter ```git clone https://github.com/gioandjake/zlow.git```
4. Once this is done, close the command terminal.

# Running the frontend (Zlow)

To run Zlow, you will need to set up a local server for it. 

## Option 1 - using the command line

1. Download and install Python at https://www.python.org/downloads/
    - When running the installer, the capital letters are the default.
    - You can check that you have it installed by entering ```python3 --version``` in the command line. 
    - To access the terminal/command line: 
        - On Windows 11, hold shift, right-click on a folder area in Windows explorer, and select "Open in Terminal". 
        - On Windows 10, hold shift, right-click on a folder area in Windows explorer, and select "open PowerShell window here". 
2. Go to the folder where Zlow is located, open the folder called frontend, and open the command line in it. 
3. Enter the command ```python3 -m http.server 8000```
4. In your web browser, open a tab to to ```localhost:8000/src/html/mainMenu.html```

## Option 2 - using a batch file

1. Download and install Python at https://www.python.org/downloads/
    - You can check that you have it installed by entering ```python3 --version``` in the command line. 
2. Go to the folder you downloaded Zlow to. 
3. Double-click on ```frontend.bat```
4. In your web browser, navigate to ```localhost:8000/src/html/mainMenu.html```

## Important note about running the frontend
Some installations of python use a different name. If this is the case, you might have to replace python3 in the command prompt above with python or py. If this is the case, the .bat script won't work either, and will also require modification. 

# Running the backend (Strava, Multiplayer, crashlogs)

To run multiplayer, Strava, and crash logging, you need a custom server. You will also need your own Strava API application created.

1. Go the the Zlow folder, and navigate to backend. 
2. Under the peer_service folder is a file called .env.example. Copy it, and name it .env.
3. Open .env and fill in your values:
```
PATH=/peerServer
PORT=9000
```
4. Go to frontend/src/js/constants.js, and at the bottom, change the values of the variables peerHost, peerPath, and peerPort to match what is in .env. 
5. Do steps 2 and 3 in the strava_service folder and the crash_logging_service folder.
6. Download and install Docker at https://www.docker.com/products/docker-desktop/
    - You can check that you have it installed by typing in ```docker -v```
    - To access the terminal/command line: 
        - On Windows 11, hold shift, right-click on a folder area in Windows explorer, and select "Open in Terminal". 
        - On Windows 10, hold shift, right-click on a folder area in Windows explorer, and select "open PowerShell window here". 
7. Go back to the backend folder, and open up the command line in it.
8. On the command line, type in ```docker-compose up``` (Leave this terminal window running)
9. The next steps are only if you want to be able to connect and upload to Strava. Strava requires a **secure public address (HTTPS)**
    1. This will require some technical knowledge, you can still upload through Strava manually downloading a TCX
10. Download ngrok at https://ngrok.com/download/windows if not downloaded (downloading from the Microsoft Store is OK)
11. Setup ngrok if not set up
    1. Sign up if you don't already have a login https://dashboard.ngrok.com/signup
    2. Install your authtoken https://dashboard.ngrok.com/get-started/your-authtoken
12. Run ngrok in powershell or command line terminal `ngrok http 8080` (Leave this terminal window running)
    1. You will see something like : `Forwarding https://jacoby-vitriolic-unruly.ngrok-free.dev -> http://localhost:8080`
14. Copy the domain from your ngrok URL into Strava’s Authorization Callback Domain field https://www.strava.com/settings/api
15. Go into your frontend code, go to `src/js/strava.js`, and replace the 2 following lines with your Strava Client ID and the https ngrok URL:
    - this.CLIENT_ID = "INPUT CLIENT ID"; - your Strava client id
    - this.BACKEND_URL = "https://YOUR-BACKEND.com"; - your ngrok URL
16. Close ngrok/terminal windows when you are done using the service

Instead of doing steps 7 and 8, you can double-click on backend.bat. This will run the backend without needing to use the command line. You will still need to create your .env files, and change the values in constants.js.

## Backend Notes: 
When running the backend locally, multiplayer will not work properly. You will only be able to run local multiplayer using two browser instances on the same computer.
Ngrok is used to safely give your local server a temporary secure public address without exposing your computer or requiring router changes.

# Reopening Zlow
When you close the command terminal, you will have to rerun the commands related to the fronend and backend to run Zlow again. You will not have to redownload Git, Python, Docker, or the Zlow source code itself. 

If you simply close the browser window, you will just have to enter ```localhost:8000/src/html/mainMenu.html``` in the web browser's address bar to reopen Zlow. 

To update Zlow, follow these steps: 

1. In the file explorer, go to the folder you downloaded Zlow to, and open the command line in it.
    - To access the terminal/command line: 
        - On Windows 11, hold shift, right-click on a folder area in Windows explorer, and select "Open in Terminal". 
        - On Windows 10, hold shift, right-click on a folder area in Windows explorer, and select "open PowerShell window here". 
2. in the command line, enter the command ```git pull```.

You can also run update.bat by double-clicking on the file. This will update Zlow without needing to use the command line. 

You do not need to close and reopen the main program terminal if you already have it running. You only need to close and reopen the backend.