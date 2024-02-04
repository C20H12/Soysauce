# SoySauce Chrome Extension

Have you been annoyed by this heinous web service named Membean? Then worry no more, the blender has come to the rescue, ready to blend up the beans and make sauce. This extension adds a button that allows any question, that's right, to be skipped and counted as correct.  
  
Why is it possible? Well, normally a website like this will do some sort of call to the server whenever a choice is selected. Then it gets a boolean value on whether it is right and shows that result to you. But no, this site is crappy such that the answer is sent with the question, then the result is determined on the client. Only after that it sents them to the server, which doesn't make a lot of sense. Additionally, the site is super insecure such that it's source code and database are exposed.  

You can test out the API at: https://orca-app-fu96x.ondigitalocean.app/

## Why is it good sauce
- Simplistic in design: an easy one-click solution that is accessible to anyone
- Well-tested and reliable: it works pretty well, and will keep working until it doesn't
- Undetectable: no one can notice that you are using it, even if they are right behind you

## How to install
Because I don't want to spend the effort to upload it onto Google, here's the steps to install the files directly:
- Goto "Releases" [or click here](https://github.com/C20H12/Soysauce/releases).
- Download the latest release .zip file
- Goto [chrome://extensions/](chrome://extensions/) 
- Top-right corner, enable "Developer mode"
- Click "Load unpacked" and choose the folder that contains this extension.

## Disclaimer
Use this software at your own risk. The author is not responsible for any consequences, direct or indirect, arising from the use of this software. User discretion is advised.