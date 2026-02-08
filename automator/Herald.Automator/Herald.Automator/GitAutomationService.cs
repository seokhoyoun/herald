using System.Diagnostics;

namespace Herald.Automator
{
    public class GitAutomationService(IConfiguration configuration)
    {
        private readonly string _repoPath =
            configuration["BlogSettings:RepoPath"]
            ?? throw new ArgumentNullException("RepoPath가 설정되지 않았습니다.");

        public void CommitAndPush(string slug)
        {
            RunCommand("git add .");
            RunCommand($"git commit -m \"feat: add daily post {slug}\"");
            RunCommand("git push origin main");
        }

        private void RunCommand(string command)
        {
            var processInfo = new ProcessStartInfo("cmd.exe", $"/c {command}")
            {
                WorkingDirectory = _repoPath,
                CreateNoWindow = true,
                UseShellExecute = false
            };
            Process.Start(processInfo)?.WaitForExit();
        }
    }
}