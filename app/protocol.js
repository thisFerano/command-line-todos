const fs = require('fs');

class Protocol {
    constructor(path) {
        this.path = path
        this.date = new Date();
        this.today = this.date.getFullYear() + '-' + this.date.getMonth() + '-' + this.date.getDate();
        this.file_name = this.path + '/' + this.today + '.json';
    }
    checkStructure() {
        try {
            if(!fs.existsSync(this.path)) {
                fs.mkdirSync(__dirname + this.path, {recursive: true})
            }
        }catch (err) {
            return err
        }
        try {
            if(!fs.existsSync(this.file_name)) {
                fs.writeFileSync(__dirname + this.file_name, '{}');
            }
        }catch (err) {
            return err
        }
    }
    protocol(msg) {
        try {
            var content = JSON.parse(fs.readFileSync(this.file_name))
            var time = this.date.getHours() + ':' + this.date.getMinutes() + ':' + this.date.getSeconds() + ':' + this.date.getMilliseconds();
            var json = {}
            json[time] = msg
            content['data'].push(json)
            fs.writeFileSync(this.file_name, JSON.stringify(content, null, 3));
            return true
        }catch (err) {
            return err
        }
    }
    //  
    // 15:30:51:420 
    // spaß section
    check_input_time(time) {
        var splitted = time.split(':')
        var counter = 0
        if(splitted.length >= 1 && splitted[0].length <= 2) {
            for(var i = 0; i < 3; i++) {
                try {
                    if(splitted[i].length > 2) {
                        counter -= 1
                    }else {
                        counter += 1
                    }
                }catch {}
            }
        }
        if(splitted.length == 4) {
            if(splitted[splitted.length - 1].length == 3) {
                counter += 1
            }
        }
        return counter == splitted.length
    }
    get_date(date=null, time=null) {
        var chars = [0, null, false, '', 'undefined', -1]
        var output = []

        if(date in chars && time in chars) return this.loadData(this.file_name)['data']
        if(time in chars) {
            this.file_name = this.path + '/' + date + '.json'
            try {
                if(!fs.existsSync(this.file_name)) return 'No Protocols available for this date'
                return this.loadData(this.file_name)['data']
            }catch (err) {
                return err
            }
        }
        
        // if(date in chars) {
        //     if(time in chars) {
        //         return this.loadData(this.file_name)['data']
        //     }
        // }else {
        //     this.file_name = this.path + '/' + date + '.json'
        //     try {
        //         if(fs.existsSync(this.file_name)) {
        //             if(time in chars) {
        //                 return this.loadData(this.file_name)['data']
        //             }
        //         }else {
        //             return 'No Protocols available for this date'
        //         }
        //     }catch (err) {
        //         return err
        //     }
        // }

        // 15
        if(!this.check_input_time(time)) {
            return 'wrong date format'
        }
        var content = this.loadData(this.file_name)
        var data = content['data']
        var time_len = time.split(':').length
        for(var i = 0; i < data.length; i++) {
            if(Object.keys(data[i])[0].split(':').slice(0, time_len).join(':') == time) {
                output.push(data[i])
            }
        }
        return output
    }
    loadData(file_name) {
        try {
            var content = JSON.parse(fs.readFileSync(file_name))
            return content
        }catch (err) {
            return err
        }
    }
}

// TODO: update time/date

module.exports = Protocol;