local Framework = GetFramework()
local Callback = (Config.Framework == "ESX" or Config.Framework == "NewESX") and Framework.TriggerServerCallback or Framework.Functions.TriggerCallback

RegisterNUICallback('Close', function()
    SetNuiFocus(false, false)
    Citizen.Wait(500)
    print("Menu zavřeno, FPS: ", GetFPS())
end)


local settings = {
    vehicleDensity = 1.0,
    reflectionsEnabled = true,
    shadowQuality = 1,
    grassQuality = 1.0,
    pedDensity = 1.0,
    scenarioPedDensity = 1.0
}


function GetCurrentSettings()
    return {
        vehicleDensity = settings.vehicleDensity * 100,
        reflectionsEnabled = settings.reflectionsEnabled,
        shadowQuality = settings.shadowQuality,
        grassQuality = settings.grassQuality * 100,
        pedDensity = settings.pedDensity * 100,
        scenarioPedDensity = settings.scenarioPedDensity * 100
    }
end


RegisterNUICallback('fetchSettings', function(data, cb)
    cb({ success = true, settings = GetCurrentSettings() })
end)


RegisterKeyMapping('fpsboost', 'FPS Menu', 'keyboard', Config.Keys)


RegisterCommand('fpsboost', function()
    local currentSettings = GetCurrentSettings()
    SendNUIMessage({ data = 'MENU', open = true, settings = currentSettings })
    SetNuiFocus(true, true)

    Citizen.CreateThread(function()
        while IsNuiFocused() do
            SendNUIMessage({ data = 'FPS_UPDATE', fps = GetFPS() })
            Citizen.Wait(500)
        end
        SetNuiFocus(false, false)
    end)
end)

function GetFPS()
    return math.floor(1.0 / GetFrameTime())
end

RegisterNUICallback('getFPS', function(data, cb)
    cb({ fps = GetFPS() })
end)

local isSettingsApplied = false

function ApplySettingsContinuously()
    if isSettingsApplied then return end
    isSettingsApplied = true

    Citizen.CreateThread(function()
        while true do
            Citizen.Wait(0)  
            SetVehicleDensityMultiplierThisFrame(settings.vehicleDensity)
            SetPedDensityMultiplierThisFrame(settings.pedDensity)
            SetRandomVehicleDensityMultiplierThisFrame(settings.vehicleDensity)
            SetParkedVehicleDensityMultiplierThisFrame(settings.vehicleDensity)
            SetScenarioPedDensityMultiplierThisFrame(settings.scenarioPedDensity, settings.scenarioPedDensity)
            SetLodScale(settings.grassQuality)
            if settings.reflectionsEnabled then
                ClearTimecycleModifier()
            else
                SetTimecycleModifier("reflection_correct_ambient")
            end
            if settings.shadowQuality == 0 then
                CascadeShadowsClearShadowSampleType()
                CascadeShadowsSetAircraftMode(false)
                CascadeShadowsEnableEntityTracker(false)
            elseif settings.shadowQuality == 1 then
                CascadeShadowsSetShadowSampleType("medium")
            elseif settings.shadowQuality == 2 then
                CascadeShadowsSetShadowSampleType("high")
            elseif settings.shadowQuality == 3 then
                CascadeShadowsSetShadowSampleType("veryHigh")
            end
            DisableVehicleDistantlights(not settings.reflectionsEnabled)
        end
    end)
end

RegisterNUICallback('applySetting', function(data, cb)
    if data.native == 'SetVehicleDensityMultiplierThisFrame' then
        settings.vehicleDensity = data.value / 100
    elseif data.native == 'ToggleReflection' then
        settings.reflectionsEnabled = data.value
    elseif data.native == 'SetShadowQuality' then
        settings.shadowQuality = data.value
    elseif data.native == 'SetGrassDensity' then
        settings.grassQuality = data.value / 100
    elseif data.native == 'SetPedDensityMultiplierThisFrame' then
        settings.pedDensity = data.value / 100
    elseif data.native == 'SetScenarioPedDensityMultiplierThisFrame' then
        settings.scenarioPedDensity = data.value / 100
    else
        cb({ status = 'error', message = 'Unknown local function' })
        return
    end
    ApplySettingsContinuously()
    cb({ status = 'ok', fps = GetFPS() })
end)
