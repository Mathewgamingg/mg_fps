Framework = nil
Framework = GetFramework()
Citizen.Await(Framework)

Callback = Config.Framework == "ESx" or Config.Framework == "NewESX" and Framework.RegisterServerCallback or Framework.Functions.CreateCallback

