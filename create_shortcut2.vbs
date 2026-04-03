Set ws = CreateObject("WScript.Shell")
Set shortcut = ws.CreateShortcut(ws.SpecialFolders("Desktop") & "\88.lnk")
shortcut.TargetPath = "C:\Users\CM\Desktop\redevelopment_작업본\index.html"
shortcut.WorkingDirectory = "C:\Users\CM\Desktop\redevelopment_작업본"
shortcut.Description = "redevelopment working copy"
shortcut.Save
WScript.Echo "OK"
