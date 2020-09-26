const Vec3 = require("vec3")

const mineflayer = require("mineflayer")
const navigatePlugin = require("mineflayer-navigate")(mineflayer);

if (process.argv.length < 4 || process.argv.length > 6) {
    console.log("Usage : node snowmaker.js <host> <port> [<name>] [<config]>")
    process.exit(1)
}
const config = require(process.argv[5] ? process.argv[5] : "./config.js")
global.WoolMask = global.WoolMask ? global.WoolMask : 0xFFFF
if (!global.StatsUnchangedTolerance)
    global.StatsUnchangedTolerance = 7

global.bot = mineflayer.createBot({
    host: process.argv[2],
    port: parseInt(process.argv[3]),
    username: process.argv[4] ? process.argv[4] : "Woolman",
    version: "1.15.2"
})
// install the plugin
navigatePlugin(bot);

global.working = false;

const navigator = require("./lib/navigator.js")
const inventory = require("./lib/inventory.js")
const sheeputil = require("./lib/sheeputil.js")

global.bot = bot
global.ad_active = true

const colors = [
    "white", "orange", "magenta", "light blue",
    "yellow", "lime", "pink", "gray",
    "light gray", "cyan", "purple", "blue",
    "brown", "green", "red", "black"
]

bot.on('whisper', (username, message) => {
    if (username === bot.username) return
    const command = message.split(' ')
    switch (true) {
        case /^list$/.test(message):
            inventory.sayItems()
            break
        case /^toss \d+ \w+$/.test(message):
            // toss amount name
            // ex: toss 64 diamond
            inventory.tossItem(command[2], command[1])
            break
        case /^toss \w+$/.test(message):
            // toss name
            // ex: toss diamond
            inventory.tossItem(command[1])
            break
        case /^storeall$/.test(message):
            autotoss()
            break
        case /^status$/.test(message):
            bot.chat(`I have ${bot.health} health and ${bot.food} food`)
            break
        case /^equip \w+ \w+$/.test(message):
            // equip destination name
            // ex: equip hand diamond
            inventory.equipItem(command[2], command[1])
            break
        case /^unequip \w+$/.test(message):
            // unequip testination
            // ex: unequip hand
            inventory.unequipItem(command[1])
            break
        case /^use$/.test(message):
            inventory.useEquippedItem()
            break
        case /^craft \d+ \w+$/.test(message):
            // craft amount item
            // ex: craft 64 stick
            navigator.goToWork(craftingtableOperatingPosition,
                () =>inventory.craftItem(command[2], command[1]) )
            break
        case /^chat /.test(message):
            bot.chat(message.replace(/^chat /, ""))
            break
        case /^work$/.test(message):
            global.working = true
            autowork()
            break
        case /^shear$/.test(message):
            var target = sheeputil.findAvailableSheep(bot)
            goShearSheep(target)
            break
        case /^stop$/.test(message):
            console.log("stop")
            global.working = false
            break
        case /^toggle/.test(message):
            global.ad_active = !global.ad_active
            bot.whisper(username, `${global.ad_active}`)
            break
        case /^getmask/.test(message):
            bot.whisper(username, `${global.WoolMask}`)
            break
        case /^setmask \d+/.test(message):
            global.WoolMask = parseInt(command[1], 10)
            bot.whisper(username, `Mark changed to ${global.WoolMask}`)
            break
        case /^xormask \d+/.test(message):
            var arg = parseInt(command[1], 10)
            global.WoolMask = global.WoolMask ^ (1 << arg)
            var action = global.WoolMask & (1 << arg) ? "collecting" : "ignoring"
            bot.whisper(username, `${global.WoolMask}, now ${action} ${colors[arg]} wool.`)
            break
        case /^reset$/.test(message):
            Reset()
    }
})

bot.on('chat', (username, message) => {
    if (username === bot.username)
        return
    if (!global.ad_active)
        return

    const my_ad = global.woolshop_ad ? global.woolshop_ad : "MY_AD"
    if (message.includes(my_ad))
        return
    function dcheck(msg, a, b)
    {
        return msg.includes(a) && msg.includes(b)
    }
    if (dcheck(message, "出", "羊毛")
        || dcheck(message, "卖", "羊毛")
        || dcheck(message, "收", "羊毛")
        || dcheck(message, "有", "羊毛"))
    {
        console.log("DETECTED:", username, message)
        bot.chat(my_ad)
    }
})
function Reset(no_auto_resume)
{
    console.log("RESET!")
    global.working = false
    setTimeout(() => bot.chat("/suicide"), 750)
    if (no_auto_resume)
        return

    setTimeout(ResumeWork, 15000)
}

function ResumeWork()
{
    console.log("ResumeWork")
    global.working = true
    if (global.cmd1)
        setTimeout(() => bot.chat(global.cmd1) , 1000);
    if (global.cmd2)
        setTimeout(() => bot.chat(global.cmd2) , 4500);
    setTimeout(autowork, 9000)
}

bot.on('login', function()
    {
        var password = global.AuthmePassword ? global.AuthmePassword : "12345678" 
        bot.chat("/L " + password);
        console.log("login")
        bot.chatAddPattern(/^\[ ?([^ ]*) -> 我?] (.*)$/, 'whisper', 'mc.66ko.cc whisper')
        /*
        bot.once('windowOpen', function(popup_window){
            console.log("Window opened, clicking...")
            bot.clickWindow(20, 0, 0)
            bot.once('spawn', function(){
                console.log(`Spawned at ${bot.entity.position}`)
                ResumeWork()
            })
        })

        setTimeout(() => bot.equip(bot.inventory.slots[40], "hand", () => {
            bot.activateItem()
        }), 10000)
        */
        setTimeout(ResumeWork, 10000)
    }
)

bot.on('kicked', (reason) => {
    console.log(`I got kicked for`, reason)
    process.exit(0)
})

function goShearSheep(target, callback)
{
    if (!target)
    {
        console.log("Null target!")
        return
    }

    function shear() 
    {
        inventory.equipItem("shears", "hand")
        bot.useOn(target)
        if (callback)
            setTimeout(callback, 400)
    }
    navigator.goToWork(target.position, shear, Reset)
}

function autotoss(final_callback)
{
    // After the flatten in 1.13
    var total = inventory.countItemById(82, 97)
    console.log("autotoss", total)
    function wrapped_callback(cur, maxv, fcb)
    {
        //console.log(`wrapped_callback(${cur}, ${maxv}, (fcb))`)
        if (cur > maxv)
        {
            fcb()
            return
        }
        const count = inventory.countItemById(cur)
        if (count && count > 0)
            bot.toss(cur, null, count, () => wrapped_callback(cur+1, maxv, fcb))
        else
            wrapped_callback(cur+1, maxv, fcb)
    }
    wrapped_callback(82, 97, final_callback)
}

last_wool = {
    id: 0,
    position: Vec3(0, 0, 0)
}

function autowork()
{
    console.log("Start autowork")
    function pick_then_act(callback)
    {
        if (global.working)
        {
            var target = sheeputil.findDroppedWool(bot)
            if (target && (target.id !== last_wool.id || !target.position.equals(last_wool.position)) )
            {
                console.log("Found dropped wool", target.position)
                navigator.goToWork(target.position, function() {
                    setTimeout(() => pick_then_act(callback), 1000)
                }, Reset)
                last_wool.id = target.id
                last_wool.position = target.position
            }
            else
            {
                callback()
            }
        }
    }
    function autoshear()
    {
        if (!global.working)
            return
        if (bot.food <= 6)
        {
            bot.chat("我饿了，我选择狗带！")
            Reset()
            return
        }

        var sheep = sheeputil.findAvailableSheep(bot)
        if (sheep)
        {
            console.log("Found sheep")
            goShearSheep(sheep, function() {
                const wools_in_inventory = inventory.countItemById(82, 97)
                console.log("wools", wools_in_inventory)
                if (wools_in_inventory >= 128)
                {
                    setTimeout(autostore, 1000)
                }
                else
                {
                    setTimeout(() => {
                        pick_then_act(autoshear)
                    }, 1000)
                }
            })
            return
        }
        // no sheep available, wait 5s
        pick_then_act(function() {
            console.log("idle...")
            const shear_cb = () => setTimeout(autoshear, 5000)
            navigator.goToWork(global.idlePosition, shear_cb, Reset)
        })
    }
    function autostore()
    {
        if (global.StorageRequiresTp)
        {
            console.log("StorageRequiresTp")
            if (global.storage_cmd1)
                setTimeout(() => bot.chat(global.storage_cmd1) , 1000);
            if (global.storage_cmd2)
                setTimeout(() => bot.chat(global.storage_cmd2) , 4500);
            setTimeout( () => autotoss(ResumeWork), 8000)
            return
        }

        navigator.goToWork(global.tossingPosition, function(){
            bot.lookAt(global.tossingLookingAtPosition)
            setTimeout( () => autotoss(function() {
                pick_then_act(autoshear)
            }), 2000)
        }, Reset)
    }

    setTimeout(autoshear, 1000)
}
