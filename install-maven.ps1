# 自动化安装 Apache Maven（Windows 版）
# 1. 下载 Maven
Invoke-WebRequest -Uri "https://dlcdn.apache.org/maven/maven-3/3.9.6/binaries/apache-maven-3.9.6-bin.zip" -OutFile "$env:TEMP\apache-maven.zip"

# 2. 解压到 C:\Program Files\Apache\maven
$dest = "C:\Program Files\Apache\maven"
Expand-Archive -Path "$env:TEMP\apache-maven.zip" -DestinationPath "C:\Program Files\Apache" -Force
# 移动解压后的文件夹到 maven
$folders = Get-ChildItem "C:\Program Files\Apache" | Where-Object { $_.PSIsContainer -and $_.Name -like "apache-maven-*" }
if ($folders.Count -gt 0) {
    Move-Item -Path $folders[0].FullName -Destination $dest -Force
}

# 3. 设置 MAVEN_HOME 环境变量
[Environment]::SetEnvironmentVariable("MAVEN_HOME", $dest, [EnvironmentVariableTarget]::Machine)

# 4. 添加 Maven bin 到 Path
$envPath = [Environment]::GetEnvironmentVariable("Path", [EnvironmentVariableTarget]::Machine)
if ($envPath -notlike "*%MAVEN_HOME%\\bin*") {
    $newPath = "$envPath;%MAVEN_HOME%\bin"
    [Environment]::SetEnvironmentVariable("Path", $newPath, [EnvironmentVariableTarget]::Machine)
}

Write-Host "Maven installation completed. Please restart your terminal and run 'mvn -v' to verify."