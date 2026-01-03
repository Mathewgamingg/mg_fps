fx_version "cerulean"
game "gta5"
lua54 'yes'

author 'MD Development / MathewGaming'
description "FPS Boost Menu"
version '1.0.0'

client_script { 
    "main/client/*.lua"
}

server_script {
    "main/server/*.lua",
} 

shared_script "main/shared.lua"


ui_page "index.html"

files {
    'index.html',
    'vue.js',
    'assets/**/*.*',
    'assets/font/*.otf'
}