// Comes from https://github.com/PrismarineJS/mineflayer
// License: MIT

function sayItems (items = bot.inventory.items()) {
    const output = items.map(itemToString).join(', ')
    if (output) {
        console.log(output)
    } else {
        console.log('empty')
    }
}

function tossItem (name, amount) {
    amount = parseInt(amount, 10)
    const item = itemByName(name)
    if (!item) {
        console.log(`I have no ${name}`)
    } else if (amount) {
        bot.toss(item.type, null, amount, checkIfTossed)
    } else {
        bot.tossStack(item, checkIfTossed)
    }

    function checkIfTossed (err) {
        if (err) {
            console.log(`unable to toss: ${err.message}`)
        } else if (amount) {
            console.log(`tossed ${amount} x ${name}`)
        } else {
            console.log(`tossed ${name}`)
        }
    }
}

function equipItem (name, destination) {
    if (destination === "hand" && bot.entity.heldItem)
        if (bot.entity.heldItem.name === name)
        {
            console.log(`Already holding ${name}`)
            return
        }

    const item = itemByName(name)
    if (item) {
        bot.equip(item, destination, checkIfEquipped)
    } else {
        console.log(`I have no ${name}`)
    }

    function checkIfEquipped (err) {
        if (err) {
            console.log(`cannot equip ${name}: ${err.message}`)
        } else {
            console.log(`equipped ${name}`)
        }
    }
}

function unequipItem (destination) {
    bot.unequip(destination, (err) => {
        if (err) {
            console.log(`cannot unequip: ${err.message}`)
        } else {
            console.log('unequipped')
        }
    })
}

function useEquippedItem () {
    console.log('activating item')
    bot.activateItem()
}

function craftItem (name, amount, callback, onerror) {
    amount = parseInt(amount, 10)
    const item = require('minecraft-data')(bot.version).findItemOrBlockByName(name)
    const craftingTable = bot.findBlock({
        matching: 58,
        maxDistance: 2
    })

    if (item) {
        const recipe = bot.recipesFor(item.id, null, 1, craftingTable)[0]
        if (recipe) {
            console.log(`I can make ${name}`)
            bot.craft(recipe, amount, craftingTable, (err) => {
                if (err) {
                    console.log(`error making ${name}`, err)
                    if (onerror)
                        setTimeout(onerror, 500)
                } else {
                    console.log(`did the recipe for ${name} ${amount} times`)
                    setTimeout(() => {
                        tossItem(`${name}`)
                        if (callback)
                            callback()
                    }, 750)
                }
            })
        } else {
            console.log(`I cannot make ${name}`)
            setTimeout(onerror, 1000)
        }
    } else {
        console.log(`unknown item: ${name}`)
    }
}

function itemToString (item) {
    if (item) {
        return `${item.name} x ${item.count}`
    } else {
        return '(nothing)'
    }
}

function itemByName (name) {
    return bot.inventory.items().filter(item => item.name === name)[0]
}

function countItemByName(name) {
    var count = 0
    for (var i in bot.inventory.items())
    {
        var item = bot.inventory.items()[i]
        if (item && item.name === name)
            count += item.count
    }
    return count
}

function countItemById(lb, rb) {
    if (!rb)
        rb = lb
    var count = 0
    for (var i in bot.inventory.items())
    {
        var item = bot.inventory.items()[i]
        if (item && (lb <= item.type && item.type <= rb))
            count += item.count
    }
    return count
}

module.exports = {
    sayItems,
    tossItem,
    equipItem,
    unequipItem,
    useEquippedItem,
    craftItem,
    itemByName,
    countItemByName,
    countItemById
}
