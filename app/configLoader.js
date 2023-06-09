const fs = require('fs');

(function() {
    
    module.exports.LoadConfigFromFile = function(fileName)
    {
        const file = fs.readFileSync("./" + fileName, "UTF-8");
        const lines = file.split('\n');
    
        const config = {};
        for (let i = 0; i < lines.length; i++)
        {
            const line = lines[i];
            if ((line.charAt(0) == '#') || (line == ""))
            {
                continue;
            }
            const components = line.split('=', 2);
            
            config[components[0]] = components[1];
        }

        return config;
    }

}());