Framework = nil
Framework = GetFramework()
Citizen.Await(Framework)

Callback = Config.Framework == "ESX" or Config.Framework == "NewESX" and Framework.RegisterServerCallback or Framework.Functions.CreateCallback

