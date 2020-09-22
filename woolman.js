const Vec3 = require("vec3")

const mineflayer = require("mineflayer")
const navigatePlugin = require("mineflayer-navigate")(mineflayer);

if (process.argv.length < 4 || process.argv.length > 6) {
    console.log("Usage : node snowmaker.js <host> <port> [<name>] [<config]>")
    process.exit(1)
}
const config = require(process.argv[5] ? process.argv[5] : "./config.js")
global.WoolMask = global.WoolMask ? global.WoolMask : 0xFFFF

global.bot = mineflayer.createBot({
    host: process.argv[2],
    port: parseInt(process.argv[3]),
    username: process.argv[4] ? process.argv[4] : "Woolman",
    version: "1.8"
})
// install the plugin
navigatePlugin(bot);

global.working = false;

const navigator = require("./lib/navigator.js")
const inventory = require("./lib/inventory.js")
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
            var target = findAvailableSheep()
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
        setTimeout(() => bot.chat(global.cmd1) , 3000);
    if (global.cmd2)
        setTimeout(() => bot.chat(global.cmd2) , 7000);
    setTimeout(autowork, 15000)
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


function findAvailableSheep()
{
    function isInRange(l, x, r)
    {
        return l<=x && x<=r
    }
    function dist(entity)
    {
        return Math.abs(bot.entity.position.x - entity.position.x) 
            +  Math.abs(bot.entity.position.z - entity.position.z)
    }
    var total = 0;
    var not_sheared = 0;

    var target = null;
    for (var key in bot.entities)
    {
        if (bot.entities[key].mobType !== "Sheep")
            continue

        if (!isInRange(SheepMinX, bot.entities[key].position.x, SheepMaxX))
            continue
        if (!isInRange(SheepMinZ, bot.entities[key].position.z, SheepMaxZ))
            continue
        if (bot.entities[key].position.y != ItemExpectedY)
            continue
        total++;

        // Adapted for 1.8, change 13 to 16 in 1.9+?
        // 13 is for 1.12
        //var sheep_info = bot.entities[key].metadata[13]
        var sheep_info = bot.entities[key].metadata[16]

        if (sheep_info & 16) // Sheared
            continue
        not_sheared++;

        // Unwanted color
        var match = (1 << (sheep_info & 0xF)) & global.WoolMask
        if (!match)
            continue

        if (!target)
            target = bot.entities[key]
        else if (dist(bot.entities[key]) < dist(target))
            target = bot.entities[key]
    }
    console.log(total, "sheeps,", not_sheared, "shearable")
    //console.log(target.metadata)
    return target
}

function findDroppedWool()
{
    function isInRange(l, x, r)
    {
        return l<=x && x<=r
    }
    for (var key in bot.entities)
    {
        if (bot.entities[key].objectType !== "Dropped item") // in 1.8
            continue
        if (!bot.entities[key].metadata[10]) // Object metadata in 1.8
            continue
        if (bot.entities[key].metadata[10].blockId !== 35) // Wool in 1.8
            continue

        if (!isInRange(SheepMinX, bot.entities[key].position.x, SheepMaxX))
            continue
        if (!isInRange(SheepMinZ, bot.entities[key].position.z, SheepMaxZ))
            continue
        if (bot.entities[key].position.y != ItemExpectedY)
            continue
        return bot.entities[key]
    }
    return null

}
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
    var count = inventory.countItemByName("wool")
    console.log("autotoss", count)
    if (count && count > 0)
        bot.toss(35, null, count, final_callback)
}

function autowork()
{
    console.log("Start autowork")
    function idle_or_pick(callback)
    {
        if (global.working)
        {
            var target = findDroppedWool()
            if (target)
            {
                console.log("Found dropped wool", target.position)
                navigator.goToWork(target.position, function() {
                    setTimeout(() => idle_or_pick(callback), 1000)
                }, Reset)
            }
            else
            {
                console.log("idle...")
                navigator.goToWork(global.idlePosition, callback, Reset)
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

        var sheep = findAvailableSheep()
        if (sheep)
        {
            console.log("Found sheep")
            goShearSheep(sheep, function() {
                console.log("wools", inventory.countItemByName("wool"))
                if (inventory.countItemByName("wool") >= 128)
                {
                    setTimeout(autostore, 1000)
                }
                else
                    setTimeout(autoshear, 200)
            })
            return
        }
        // no sheep available, wait 5s
        idle_or_pick(function() {
            setTimeout(autoshear, 5000)
        })
    }
    function autostore()
    {
        navigator.goToWork(global.tossingPosition, function(){
            bot.lookAt(global.tossingLookingAtPosition)
            setTimeout( () => autotoss(function() {
                idle_or_pick(autoshear)
            }), 2000)
        }, Reset)
    }

    setTimeout(autoshear, 1000)
}
