using DotNetEnv;
using Herald.Automator;
using Microsoft.Extensions.Hosting.WindowsServices;

internal class Program
{
    private static void Main(string[] args)
    {
        Env.Load();

        var builder = Host.CreateApplicationBuilder(args);
        var runNow = args.Any(arg => arg.Equals("--run-now", StringComparison.OrdinalIgnoreCase));

        builder.Services.Configure<BlogSettings>(builder.Configuration.GetSection("BlogSettings"));
        builder.Services.AddSingleton(new RuntimeFlags(runNow));
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
