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
Some installations of python use a different name. If this is the case, you might have to replace python3 in the command prompt with python or py. If this is the case, the .bat script won't work either, and will also require modification. 