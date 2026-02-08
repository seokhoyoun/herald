using DotNetEnv;
using Herald.Automator;
using Microsoft.Extensions.Hosting.WindowsServices;

internal class Program
{
    private static void Main(string[] args)
    {
        Env.Load();

        var builder = Host.CreateApplicationBuilder(args);
        builder.Services.AddHostedService<Worker>();
        builder.Services.AddTransient<BlogGenerator>();
        builder.Services.AddTransient<GitAutomationService>();

        if (WindowsServiceHelpers.IsWindowsService())
        {
            builder.Services.AddWindowsService(options =>
            {
                options.ServiceName = "Herald Automator";
            });
        }

        var host = builder.Build();

        host.Run();
    }
}