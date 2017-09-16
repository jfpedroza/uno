/**
 * @author Jhon Pedroza <jhonfpedroza@gmail.com>
 */

var shell = require('shelljs');

shell.mkdir('/dist/');
shell.cp('-R', 'src/public/img', 'dist/public/');
shell.cp('src/public/index.html', 'dist/public/');
shell.cp('src/public/styles.css', 'dist/public/');
shell.cp('-R', 'dist/models', 'dist/public/');