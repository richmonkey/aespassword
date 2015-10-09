module.exports = function(grunt) {
    grunt.initConfig({
        electron: {
            osxBuild: {
                options: {
                    name: 'AESPassword',
                    dir: 'app',
                    out: 'dist/osx',
                    version: '0.30.2',
                    platform: 'darwin',
                    arch: 'x64',
                    "app-bundle-id": 'com.beetle.aespassword',
                    icon: 'assets/osx/panda.icns',
                    sign: 'iPhone Developer: Zhifeng Zhou',
                    overwrite: true
                }
            },
            win32Build: {
                options: {
                    name: 'AESPassword',
                    dir: 'app',
                    out: 'dist/win32',
                    version: '0.30.2',
                    platform: 'win32',
                    arch:"ia32",
                    icon:"assets/win/panda.ico",
                    overwrite: true
                }
            }
        },

        appdmg: {
            options: {
                title: 'aespassword',
                icon: 'assets/osx/panda.icns',
                background: 'assets/osx/background.png',
                'icon-size': 128,
                contents: [
                    { "x": 438, "y": 344, "type": "link", "path": "/Applications" },
                    { "x": 192, "y": 344, "type": "file", path: "dist/osx/AESPassword-darwin-x64/AESPassword.app" }
                ]
            },
            target: {
                dest: 'dist/osx/AESPassword.dmg'
            }
        }
    });

    grunt.loadNpmTasks('grunt-electron');
    grunt.loadNpmTasks('grunt-appdmg');

}
