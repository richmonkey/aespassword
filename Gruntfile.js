module.exports = function(grunt) {
    grunt.initConfig({
        appdmg: {
            options: {
                title: 'aespassword',
                icon: 'assets/osx/panda.icns',
                background: 'assets/osx/background.png',
                'icon-size': 128,
                contents: [
                    { "x": 438, "y": 344, "type": "link", "path": "/Applications" },
                    { "x": 192, "y": 344, "type": "file", path: "dist/osx/aespassword-darwin-x64/aespassword.app" }
                ]
            },
            target: {
                dest: 'dist/osx/aespassword.dmg'
            }
        }
    });

    grunt.loadNpmTasks('grunt-appdmg');
}
