const fs = require('fs')
const paths = require('path')

const todos = paths.join(__dirname, '/data/todos.json')
const helpFile = paths.join(__dirname, '/data/help.json');
const listsFile = paths.join(__dirname, '/data/lists.json');
const settingsFile = paths.join(__dirname, '/data/settings.json');
const responseFile = paths.join(__dirname, './data/response.json')

// const print = (msg, counter) => {
//     console.log(msg)
//     counter += 1
// }

const clearLines = (n) => {
    for(let i = 0; i < n; i++) {
        const y = i === 0 ? null : -1
        process.stdout.moveCursor(0, y)
        process.stdout.clearLine(1)
    }
    process.stdout.cursorTo(0)
}

const loadData = (file) => {
    switch(file) {
        case "todos":
            try {
                return JSON.parse(fs.readFileSync(todos, 'utf8'));
            } catch (err) {
                console.error(err);
                return false;
            }
        case "help":
            try {
                return JSON.parse(fs.readFileSync(helpFile, 'utf8'));
            } catch (err) {
                console.error(err);
                return false;
            }
        case 'lists':
            try {
                return JSON.parse(fs.readFileSync(listsFile, 'utf8'));
            } catch (err) {
                console.error(err);
                return false;
            }
        case 'settings':
            try {
                return JSON.parse(fs.readFileSync(settingsFile, 'utf8'));
            } catch (err) {
                console.error(err);
                return false;
            }
        default:
            return false
    }
}

const spaceLine = () => {
    print('')
}

const showTodos = () => {
    const object = loadData('todos')
    for(var i = 1; i <= object['0']; i++) {
        print(i.toString() + ': ' + object[i.toString()])
    }
}

const response = () => {

}

const showPage = (type) => {
    switch(type) {
        case 'settings':
            show('settings')
            break;
        case 'help':
            show('hellp')
            break;
        default:
            break
    }
}

const show = (type) => {
    const object = loadData(type)
    for(var i = 0; i < object.keys(object).length; i++) {
        print(Object.keys(object)[i] + ': ' + object.values(object)[i])
    }
    spaceLine()
}

const sleep = (ms) => {
    return new Promise(resolve =>  setTimeout(resolve, ms))
}

const versionChecker = async () => {
    print('Checking version...')
    return await pjson.version
}

module.exports = {
    clearLines,
    loadData,
    spaceLine
}