fx_version "cerulean"
game "gta5"
lua54 'yes'

author 'MG / MathewGaming'
description "FPS Boost Menu"
version '1.0.0'

client_script { 
    "main/client.lua"
}

server_script {
    '@mysql-async/lib/MySQL.lua',
    "main/server.lua",
} 

shared_script "main/shared.lua"


ui_page "index.html"

files {
    'index.html',
    'vue.js',
    'assets/**/*.*',
    'assets/font/*.otf'
}

escrow_ignore { 'main/shared.lua' }

-- dependency '/assetpacks'