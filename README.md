#安装编译sqlite3 方法1
1. yarn add sqlite3
2. ./node_modules/.bin/electron-rebuild --version 1.7.9

#安装编译sqlite3
1. cd app/node_modules
2. 下载sqlite3的源代码 git clone https://github.com/mapbox/node-sqlite3.git sqlite3
3. cd sqlite3
4. 安装sqlite3的依赖 npm install
4. 编译sqlite3 HOME=~/.electron-gyp node-gyp rebuild --module_name=node_sqlite3 --module_path=../lib/binding/node-v44-darwin-x64 --target=0.30.2 --arch=x64 --dist-url=https://atom.io/download/atom-shell

5. 编译sqlite3 HOME=~/.electron-gyp node-gyp rebuild --module_name=node_sqlite3 --module_path=../lib/binding/node-v44-win32-ia32 --target=0.30.2 --arch=ia32 --dist-url=https://atom.io/download/atom-shell

6. 编译sqlite3 HOME=~/.electron-gyp node-gyp rebuild --module_name=node_sqlite3 --module_path=../lib/binding/node-v46-linux-x64 --target=1.6.5 --arch=x64 --dist-url=https://atom.io/download/electron


#生成dmg
yarn run dist

#win安装包
1. yarn run packWin32

2. 下载并安装Inno 5.5.6 unicode 版本
   下载地址:http://jrsoftware.org/isdl.php

3. 使用Inno Setup Compile编译setup.iss,生成dist\win32\aespassword_setup.exe安装包

