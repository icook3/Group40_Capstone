# Downloading Zlow

To run Zlow, first you will need to download the code for it: 

1. Download and install git at https://git-scm.com
    - You can check that you have it installed by typing in ```git -v``` in the command line. 
2. Go to the folder you want to download Zlow to, and open the command line in it
    - On Windows 11, you do this by right-clicking, and selecting "Open in Terminal"
    - On windows 10, you do this by holding shift, right-clicking, and selecting "open PowerShell window here". 
3. In the command line, type in ```git clone https://github.com/gioandjake/zlow.git```

# Running the frontend

To run the frontend, you will need to set up a local server for it. There are many ways to do this, but here is the way that it has been tested using. 

1. Download and install Python at https://www.python.org/downloads/
    - You can check that you have it installed by typing in ```python3 --version``` in the command line. 
2. Go to the folder you downloaded Zlow to, navigate to frontend, and open the command line in it. 
    - On Windows 11, you do this by right-clicking, and selecting "Open in Terminal"
    - On windows 10, you do this by holding shift, right-clicking, and selecting "open PowerShell window here".
3. Type in the command ```python3 -m http.server 8000```
4. In your web browser, navigate to ```localhost:8000/src/html/mainMenu.html```

I have also provided a handy .bat file if you do not want to deal with navigating the command line. To use this, here are the steps: 

1. Download and install Python at https://www.python.org/downloads/
    - You can check that you have it installed by typing in ```python3 --version``` in the command line. 
2. Go to the folder you downloaded Zlow to. 
3. Double-click on ```frontend.bat```
4. In your web browser, navigate to ```localhost:8000/src/html/mainMenu.html```

## Important note about running the frontend
Some installations of python use a different name. If this is the case, you might have to replace python3 in the command prompt above with python or py. If this is the case, the .bat script won't work either, and will also require modification. 

# Running the backend

Some features of Zlow are not available with just the frontend. To use these locally, you will need to run the backend as well. This is a bit more complicated. 

1. Go the the Zlow folder, and navigate to backend. 
2. Under the peer_service folder is a file called .env.example. Copy it, and name it .env.
3. Open .env and fill in your values:
```
PATH=/peerServer
PORT=8080
```
4. Go to frontend/src/js/constants.js, and at the bottom, change the values of the variables peerHost, peerPath, and peerPort to match what is in .env. 
5. Do steps 2 and 3 in the strava_service folder. Below are the values to put in .env.
```
STRAVA_CLIENT_ID=your_client_id
STRAVA_CLIENT_SECRET=your_client_secret
FRONTEND_URI=https://your-frontend.example.com
FRONTEND_REDIRECT_URI=https://your-frontend.example.com/path
PORT=8080
```
6. Download and install Docker at https://www.docker.com/products/docker-desktop/
    - You can check that you have it installed by typing in ```docker -v```
7. Go back to the backend folder, and open up the command line in it.
    - On Windows 11, you do this by right-clicking, and selecting "Open in Terminal"
    - On windows 10, you do this by holding shift, right-clicking, and selecting "open PowerShell window here".
8. On the command line, type in ```docker-compose up```
9. If you want to use the Strava services, follow steps 5 and 6 in strava_service/README.md. 

Instead of doing steps 6 and 7, you can instead double-click on backend.bat. This will run the backend without needing to use the command line. You will still need to create your .env files, and change the values in constants.js. 

## A note about running the backend: 
When running the backend locally, multiplayer will not work properly. You will only be able to run local multiplayer using two browser instances on the same computer. 