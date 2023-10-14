# SoySauce Chrome Extension

Have you been annoyed by this heinous web service named Membean? Then worry no more, the blender has come to the rescue, ready to blend up the beans and make sauce. This extension adds a button that allows any question, that's right, to be skipped and counted as correct.  
  
Why is it possible? Well, normally a website like this will do some sort of API call whenever a choice is selected. Then it gets a boolean value on whether it is right and shows that result to you. But no, this site is crappy such that the answer is sent with the question, then the result is determined on the client. Only after that it sents them to the server, which doesn't make a lot of sense. Should have used SSR to be real.

## Why is it good sauce
- Simplistic in design: an easy one-click solution that is accesable to anyone
- Well-tested and reliable: it works pretty well, and will keep working until it doesn't
- Undetectable: no one can notice that you are using it, even if they are right behind you

## How to install
Because I don't want to spend the effort to upload it onto Google, here's the steps to install the files directly:
- Download as ZIP, then unzip the file. Or clone the repo.
- Goto [chrome://extensions/](chrome://extensions/) 
- Top-right corner, enable "Developer mode"
- Click "Load unpacked" and choose the folder the contains this extension.