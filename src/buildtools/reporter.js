module.exports = {
    reporter: function reporter(results) {
        var sys = require('sys'),
            len = results.length,
            str = '',
            file, error;

        results.forEach(function (result) {
            file = result.file;
            error = result.error;
            str += file  + ': line ' + error.line + ', col ' +
                error.character + ', ' + error.reason + '\n';
        });

        if (len > 0) {
		sys.puts((str + "\n" + len + ' error' + ((len === 1) ? '' : 's')));	
	}
        process.exit(len > 0 ? 1 : 0);
    }
};

