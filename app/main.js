#!/usr/bin/env node
const fs = require('fs');
const giveout = require('prompt-sync')({ sigint: true });
const readline = require('readline');
// const rl = readline.createInterface({
//     input: process.stdin,
//     output: process.stdout
// })
const paths = require('path');
const pjson = require(paths.join(__dirname, '/package.json'));
const todos = paths.join(__dirname, '/data/todos.json')
const helpFile = paths.join(__dirname, '/data/help.json');
const listsFile = paths.join(__dirname, '/data/lists.json');
const settingsFile = paths.join(__dirname, '/data/settings.json');
const colors = require('colors');
const protocol = require('./protocol')
const p = new protocol('/data/protocol');
const { clearLines, loadData } = require('./utils')
const Response = require('./response');
const response = new Response()
// ['home', 'help', 'local', "online", 'list', 'settings']
let state = 'home';
let lists = {}
let currentList = false
let stop = false;
let tempList = false;
let counter = 3;

colors.setTheme({
    s: 'bgWhite',
    sText: 'black',
    reset: 'reset',
    error: 'red'
})

const print = (msg) => {
    console.log(msg);
    counter += 1
}

const prompt = (msg) => {
    print(msg.s.sText)
    const input = giveout()
    clearLines(counter)
    return input
}

const storeData = (data) => {
    let object = loadData('todos');
    if (object == false) {
        object = {"0": 1, "1": data};
    } else {
        if(data.replace(/\s/g, '').length != 0) {
            const key = object["0"] + 1;
            object["0"] = key;
            object[key.toString()] = data;
            print('Created "' + data + '".');
        }else {
            print('Sorry, empty input...');
        }
    }
    
    try {
        fs.writeFileSync(todos, JSON.stringify(object, null, 3));
    } catch (err) {
        console.error(err);
    }
}

const storeListData = (file, list, data) => {
    let object = loadData(file);
    if(data.replace(/\s/g, '').length != 0) {
        const key = object[list]['elements']["0"] + 1;
        object[list]['elements']["0"] = key;
        object[list]['elements'][key] = data;
        print('Created "' + data + '".');
    }else {
        print('Sorry, wrong input...')
    }
    try {
        fs.writeFileSync(listsFile, JSON.stringify(object, null, 3));
    }catch (err) {
        console.error(err);
    }
}

const createList = (data) => {
    let object = loadData(lists)
    if(data.replace(/\s/g, '').length != 0) {
        object[object.length] = {
            "name": data,
            "key": "20",
            "elements:": {
                "0": 0,
            }
        }
    } else {
        print('Sorry, wrong input...')
    }
    try {
        fs.writeFileSync(listsFile, JSON.stringify(object, null, 3))
    }catch (err) {
        console.error(err)
    }
}

const deleteKeyInLists = (key, list) => {
    let file_content = loadData('lists');
    object = file_content[list]['elements'];
    func = deleteByKeyFunction(key, object)
    deleted = func[0]
    object = func[1]
    try {
        file_content[list]['elements'] = object;
        fs.writeFileSync(listsFile, JSON.stringify(file_content, null, 3));
    }catch (err) {
        console.error(err)
    }
    return deleted
}

const deleteByKey = (key) => {
    let object = loadData('todos');
    func = deleteByKeyFunction(key, object)
    deleted = func[0]
    object = func[1]
    try {
        fs.writeFileSync(todos, JSON.stringify(object, null, 3));
    }catch (err) {
        console.error(err)
    }
    return deleted
}

const deleteByKeyFunction = (key, object) => {
    key.toString();
    const originalLength = object["0"];
    if (object == false || key <= 0 || key > originalLength) {
        return -1;
    }
    const deleted = object[key];
    delete object[key];
    object["0"] = originalLength - 1;

    while (key < originalLength) {
        const nextKey = (parseInt(key) + 1).toString();
        object[key] = object[nextKey];
        key++;
        if (key == originalLength) {
            delete object[key];
        }
    }

    return [deleted, object];
}

const spaceLine = () => {
    print('')
}

const showTodos = () => {
    const object = loadData('todos');
    for (var i = 1; i <= object['0']; i++) {
        print(i.toString() + ": " + object[i.toString()]);
    }
    spaceLine()
}

const showHelp = () => {
    const object = loadData('help');
    // spaceLine()
    print('Help-List')
    spaceLine()
    for (var i = 0; i < Object.keys(object).length; i++) {
        print(Object.keys(object)[i] + ': ' + Object.values(object)[i]);
    }
    spaceLine()
}

const showSettings = () => {
    const object = loadData('settings');
    print('Settings')
    spaceLine()
    for (var i = 0; i < Object.keys(object).length; i++) {
        print(Object.keys(object)[i] + ': ' + Object.values(object)[i]);
    }
    spaceLine()
    // print(response.global.not_available)
    // spaceLine()
}

const moveTodos = (first, second) => {
    const object = loadData('todos');
    first = parseInt(first);
    second = parseInt(second);
    if (!(first > 0 && first <= object['0'] && second > 0 && second <= object[0] && first != second)) {
        print('Sorry, IDs nicht gültig...');
        return -1;
    }
    [object[first], object[second]] = [object[second], object[first]];
    try {
        fs.writeFileSync('todos', JSON.stringify(object, null, 3));
    } catch (err) {
        console.log(err);
    }
    print('Moved', first.toString(), 'with', second.toString(), '.');
}

const showLists = () => {
    const object = loadData('lists');
    // spaceLine()
    print('Local lists')
    spaceLine()
    for(var i = 1; i < Object.keys(object).length; i++) {
        print((i) + ": " + Object.values(object)[i]['name'])
        lists[i] = Object.values(object)[i]['name']
    }
    spaceLine()
    return object
}

const openList = (list) => {
    const object = loadData('lists');
    try {
        print(object[list]['name']);
        spaceLine()
        for(var i = 1; i < Object.keys(object[list]['elements']).length; i++) {
            print(Object.keys(object[list]['elements'])[i] + ': ' + Object.values(object[list]['elements'])[i])
        }
    }catch {
        print('Sorry, list not found...');
    }
    spaceLine()
}

const sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function versionChecker() {
    print('Checking version...')
    return await pjson.version
}

function updateChecker() {
    print('No updates available.')
}

async function structureChecker(file, counter, nonFunctional) {
    var content = loadData(file);
    switch(file) {
        case todos:
            break
        case listsFile:
            if(Object.keys(json).length == 0) {
                print('Missing ids...')
                if(!nonFunctional.contains(lists)) {
                    nonFunctional.push(lists)
                    counter -= 1
                }
                return false
            }else {
                e = ['name', 'key', 'elements']
                for(var i = 0; i < e.length; i++) {
                    if(content[Object.keys(content)[0]].hasOwnProperty(e[i]) == false) {
                        switch (e[i]) {
                            case 'name':
                                print('Missing name...')
                                await sleep(100)
                                print('Adding name...')
                                content[Object.keys(content)[0]]['name'] = 'List (autogenerated)'
                                break
                            case 'key':
                                print('At least on list is missing a key...')
                                break
                            case 'elements':
                                print('Missing elements...')
                                await sleep(100)
                                print('Adding standard elements...')
                                content[Object.keys(content)[0]]['elements'] = {"0": 0}
                                break
                            default:
                                break
                        }
                    }
                }
                if(!nonFunctional.contains(lists)) {
                    nonFunctional.push(lists)
                    counter -= 1
                }
            }
            return counter

        case settingsFile:
            break
        default:
            break
    }
}

async function fileChecker() {
    print('Checking files...')
    await sleep(500)
    // const files = ['todos', 'help', 'lists', 'settings']
    const fileList = [todos, helpFile, listsFile, settingsFile]
    var counter = 0
    var nonFunctional = []
    for(var i = 0; i < fileList.length; i++) {
        // console.log(i)
        if(!fs.existsSync(fileList[i])) {
            print('File "' + fileList[i].split('data\\')[1] + '" not found.'.error)
        }else {
            content = fs.readFileSync(fileList[i], 'utf8')
            print('Checking file "' + fileList[i].split('data\\')[1] + '"...')
            if(fileList[i] == 'help') {
                counter += 1
                // console.log('counted')
                print(('File "' + fileList[i].split('data\\')[1] + '" found and functional.'))
            }else if(content.charAt(0) == '{' && content.charAt(content.length - 1) == '}') {
                // console.log('counted')
                counter += 1
                print(('File "' + fileList[i].split('data\\')[1] + '" found and functional.'))
                spaceLine()
            }else {
                console(('File "' + fileList[i].split('data\\')[1] + '" found but not functional.').error)
                nonFunctional.push(fileList[i])
                spaceLine()
            }           
        }
    }
    // print(counter, nonFunctional)
    if(counter == fileList.length) {
        print('All files found and functional.')
    }else {
        // print(nonFunctional)
        var diff = fileList.length - counter
        if(diff == 1) {
            msg = 'There is a problem with one file.'
        }else {
            msg = 'There are problems with ' + diff.toString() + ' files.'
        }
        print(msg.error)
        // repairFiles(nonFunctional, content)
    }
}


async function repairFiles(lists)  {
    print('Repairing files...')
    var len = lists.length
    var repaired = []
    for(var i = 0; i < len; i++) {
        try {
            var content = fs.readFileSync(lists[i], 'utf8')
        }catch (err) {
            console.error(err)
        }
        if(content.length < 2) {
            content = '{}'
            return 1
        }
        if(!content.startsWith('{')) {
            content = ['{', content].join('')
        }
        if(!content.endsWith('}')) {
            content = [content, '}'].join('')
        }
        content = JSON.stringify(JSON.parse(content), null, 3)
        try {
            fs.writeFileSync(lists[i], content)
            repaired.push(lists[i].split('data\\')[1])
            // print('File "' + lists[i].split('data\\')[1] + '" repaired.')
        }catch (err) {
            console.error(err)
        }
    }
    await sleep(500)
    var msg
    if(repaired.length == 1) {
        msg = repaired.length +  ' file repaired. ' + '(' + repaired.join(', ') + ')'
    }else {
        msg = repaired.length +  ' files repaired. ' + '(' + repaired.join(', ') + ')'
    }
    print(msg)
    await sleep(300)
    fileChecker()
}

async function runDoctor() {
    print('----------------------------------------')
    version = await versionChecker()    
    await sleep(500)
    print('Version: ' + version)
    print('--------------------')
    print('Checking for updates')
    updateChecker()
    await sleep(500)
    print('----------------------------------------')
    await fileChecker()
    print('----------------------------------------')
}

const checkGlobalKeys = (input) => {
    switch(input.toLowerCase()) {
        case 'ee':
            print(response.global.bye)
            stop = true
            process.exit()
    }
}

const main = () => {
    spaceLine()

    if(state == 'home') {
        showTodos();
        const input = prompt(response.home.main)
        // const input = prompt('Number to delete : String to create : h for help-list : T to open TODO-Menu : E to exit => ')
        checkGlobalKeys(input)
        if (input.includes(',')) {
            const nums = input.split(',');
            if (!(nums.length > 2) && (/^\d+$/.test(nums[0]) && /^\d+$/.test(nums[1]))) {
                moveTodos(nums[0], nums[1]);
                spaceLine()
                return 1;
            }
        }
        if (/^\d+$/.test(input)) {
            deleted = deleteByKey(input);
            if(deleted == -1) {
                print('Sorry, ID not found...')
            }else {
                print('Deleted "' + deleted + '".');
            }
            tempList = false
            return 1;
        }
        switch(input.toLowerCase()) {
            case 't':
                state = 'local'
                break
            case 'a':
                showTodos()
                const question = prompt(response.home.remove)
                // const question = prompt('Do you want to remove all todos? (Y/n)')
                if(question.toLowerCase() == 'y' || !question) {
                    tempList = loadData('todos');
                    fs.writeFileSync(todos, '{"0":0}');
                    print('Cleared list.');
                    print('To restore the list type in R')
                }else {
                    print('Aborted.')
                }
                break
            case 'r':
                if(tempList == false) {
                    print('Nothing to restore');
                    return -1;
                }
                fs.writeFileSync(todos, JSON.stringify(tempList, null, 3));
                print('Restored list.');
                tempList = false;
                break
            case 'h':
                state = 'help'
                break
            case 'e':
                print(response.global.bye)
                stop = true;
                break
            case 's':
                state = 'settings'
                break
            default:
                storeData(input);
                break

        }
    }else if(state == 'help') {
        showHelp()
        const input = prompt(response.global.simple)
        // const input = prompt('E to return to Home => ')
        checkGlobalKeys(input)
        if(input.toLowerCase() == 'e') {
            state = 'home'
        }else {
            print('Sorry, wrong input...')
        }
    }else if(state == 'local') {
        showLists()
        const object = loadData('lists');
        const input = prompt(response.local.main)
        // const input = prompt('O to switch to Online List : E to return to Home => ')
        checkGlobalKeys(input)
        for(var i = 1; i < Object.keys(object).length; i++) {
            // console.log(input.toString().toLowerCase(), Object.values(object)[i]['name'].toLowerCase())
            if(input.toString().toLowerCase() == Object.values(object)[i]['name'].toLowerCase() 
                || lists[input] == Object.values(object)[i]['name']) {
                state = 'list'
                currentList = Object.keys(object)[i]
                return 1
            } else {
                // createList(input)
                // print("Created new list: " + input)
            }
        }
        // if (/^\d+$/.test(input)) {
        //     state = 'list'
        //     if(input in lists) {
        //         var name = lists[input]
        //         if(name.toString().toLowerCase() == Object.values(object)[i]['name'].toLowerCase()) {
        //             state = 'list'
        //             currentList = Object.keys(object)[i]
        //             return 1
        //         }
        //     }
        // }else 
        if(input.toLowerCase() == 'e') {
            state = 'home'
            currentList = false
        }else if(input.toLowerCase() == 'o') {
            state = 'online'
        }else {
            // createList(input)
        }
    }else if(state == 'online') {
        spaceLine()
        print('At the moment not available')
        const input = prompt('E to return to Home => ')
        checkGlobalKeys(input)
        if(input.toLowerCase() == 'e') {
            state = 'home'
            currentList = false
        }else {
            print('Sorry, wrong input...')
        }
    }else if(state == 'list') {
        openList(currentList)
        const input = prompt('E to return to Home => ')
        checkGlobalKeys(input)
        if (input.includes(',')) {
            const nums = input.split(',');
            if (!(nums.length > 2) && (/^\d+$/.test(nums[0]) && /^\d+$/.test(nums[1]))) {
                // moveTodos(nums[0], nums[1]);
                spaceLine()
                return 1;
            }
        }
        if (/^\d+$/.test(input)) {
            deleted = deleteKeyInLists(input, currentList);
            if(deleted == -1) {
                print('Sorry, ID not found...')
            }else {
                print('Deleted "' + deleted + '".')
            }
            tempList = false
            return 1;
        }

        switch(input.toLowerCase()) {
            case 'a':
                // print('Not available')
                print(response.global.wrong_input)
                // tempList = loadData('todos');
                // fs.writeFileSync(todos, '{"0":0}');
                // print('Cleared list.');
                // print('To restore the list type in R')
                break
            case 'r':
                print(response.global.wrong_input)
                // if(tempList == false) {
                //     print('Nothing to restore');
                //     return -1;
                // }
                // fs.writeFileSync('todos', JSON.stringify(tempList, null, 3));
                // print('Restored list.');
                // tempList = false;
                break
            case 'e':
                state = 'local'

                break
            default:
                storeListData("lists", currentList, input);
                break

        }
    }else if(state == 'settings') {
        showSettings()
        const input = prompt(response.global.simple)
        checkGlobalKeys(input)
        if(input.toLowerCase() == 'e') {
            state = 'home'
        }else {
            print(response.global.wrong_input)
        }
    }
}

//start it up
var args = process.argv.slice(2);
p.checkStructure()

// console.log(args);
switch(args[0]) {
    case 'doctor': case 'dr':
        p.protocol('Running doctor')
        runDoctor()
        break
    case 'help':
        collumn = 43 / 2
        helpUsage = {
            't': 'Start todo',
            't doctor/dr': 'Runs the doctor',
            't help': 'Shows this help',
            // 't'
        }
        help = 't <command>\n\n' + 'Usage:\n'

        console.log(help)
        for(var att in helpUsage) {
            var att2 = att
            for(var i = collumn - att.length; i > 0; i--) {
                att2 += ' '
            }
            console.log(att2 + helpUsage[att])
        }
        break
    default:
        p.protocol('Starting todo')
        console.clear()
        while(!stop) {
            // spaceLine()
            // password
            // const input = prompt('Password =>')
            // if(input != "abc") {
            //     print('Wrong password')
            //     spaceLine()
            //     continue
            // }
            main()
        }
        process.exit()
        
}



// TODO: - online (-> generate key to "send" todo-list) or local(json)
// TODO: - list various todos
// TODO: - online + local in one list
