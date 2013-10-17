/**
 * 自动打包压缩
 * @param grunt
 */
module.exports = function(grunt) {
    /**
     * 与文件名对应
     * @type {string}
     */
    var packageName = 'package',
        version = '<%= '+ packageName +'.version %>',
        name = '<%= '+ packageName +'.name %>',
        author = '<%= '+ packageName +'.author %>',
        description = '<%= '+ packageName +'.description %>',
        srcPath = '',
        buildPath = 'bin',
        cfgFile = packageName + '.json',
        jsSuffix = '.js',
        buildTime = grunt.template.today("yyyy-mm-dd H:MM:ss"),

        banner = [
            '/* ================================================================\n',
            ' * '+ name +'.js v'+ version +'\n',
            ' *\n',
            ' * '+ description +'\n',
            ' * Latest build : '+ buildTime +'\n',
            ' *\n',
            ' * ================================================================\n',
            ' *',
            ' * Copyright (C) 2012-2013 xudafeng <xudafeng@126.com>\n',
            ' * Improved from civet https://github.com/xudafeng/civet\n',
            ' * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"\n',
            ' * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE\n',
            ' * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE\n',
            ' * ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> BE LIABLE FOR ANY\n',
            ' * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES\n',
            ' * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;\n',
            ' * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND\n',
            ' * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT\n',
            ' * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF\n',
            ' * THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.\n',
            ' * ================================================================ */\n'
        ].join(''),

        tinyBanner = '/*! '+name + ' v' + version + ' ' + author + ' ' + buildTime + ' */\n';
    /**
     * 文件队列映射
     * @type {Array}
     */
    var filesMap = [
        {
            name : 'passme',
            concat : true
        }
    ];
    /**
     * 创建文件任务队列
     * @param task
     * @param path
     * @param filesMap
     * @returns {Array}
     */
    var createTarget = function(task,path,filesMap){
        var _t = [];
        for(var i in filesMap){
            filesMap[i][task] && _t.push(path +'/'+ filesMap[i]['name'] + jsSuffix);
        }
        return _t;
    };
    /**
     * 创建配置
     */
    var config = {
        /**
         *  导入配置文件
         */
        package: grunt.file.readJSON(cfgFile),
        banner: banner,
        concat: {
            options: {
                banner: '<%= banner %>'
            },
            build: {
                src: createTarget('concat',srcPath,filesMap),
                dest: buildPath + '/' + name + jsSuffix
            }
        },
        /**
         *  使用uglify获取压缩版本
         */
        uglify: {
            options: {
                banner: tinyBanner,
                sourceMap: buildPath + '/' + name + ".map"
            },
            build: {
                src: buildPath + '/' + name + jsSuffix,
                dest: buildPath + '/' + name +'.min' + jsSuffix
            }
        }
    };
    grunt.initConfig(config);
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.registerTask('default',['concat','uglify']);
};
