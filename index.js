#!/usr/bin/env node

import { Command } from "commander";
import simpleGit from "simple-git";
import fs from "fs-extra";
import path from "path";
import { exec } from "child_process";

const program = new Command();

// Define the default GitHub repository URL
const DEFAULT_REPO_URL = "https://github.com/xuantuong265/base-app-nextjs.git";

// Define the CLI tool
program
  .name("nextjs-base-cli")
  .description(
    "A CLI to create a new project based on a predefined GitHub template"
  )
  .version("1.0.0");

// Add the "new" command
program
  .command("create <projectName>")
  .description("Create a new project using a predefined GitHub repository")
  .action(async (projectName) => {
    try {
      const targetDir = path.resolve(process.cwd(), projectName);

      console.log(`Creating a new project named "${projectName}"...`);
      console.log(
        `Cloning repository from ${DEFAULT_REPO_URL} into "${projectName}"...`
      );

      // Step 1: Clone the repository
      const git = simpleGit();
      await git.clone(DEFAULT_REPO_URL, targetDir);

      // Step 2: Remove the old .git folder
      const gitDir = path.join(targetDir, ".git");
      if (fs.existsSync(gitDir)) {
        console.log("Removing old Git history...");
        await fs.remove(gitDir);
        console.log("Old Git history removed.");
      }

      // Step 3: Initialize a new Git repository
      console.log("Initializing a new Git repository...");
      await git.cwd(targetDir).init();
      console.log("New Git repository initialized.");

      // Step 4: Customize the project (e.g., update package.json)
      console.log("Customizing the project...");
      const packageJsonPath = path.join(targetDir, "package.json");
      if (fs.existsSync(packageJsonPath)) {
        const packageJson = await fs.readJson(packageJsonPath);
        packageJson.name = projectName;
        await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });
        console.log("Updated package.json with the new project name.");
      } else {
        console.log("No package.json found. Skipping customization.");
      }

      // Step 5: Install dependencies using yarn
      console.log("Installing dependencies using yarn...");
      exec("yarn install", { cwd: targetDir }, (error, stdout) => {
        if (error) {
          console.error(`Error installing dependencies: ${error.message}`);
          return;
        }
        console.log(stdout);
        console.log(
          "Dependencies installed successfully! Project setup complete!"
        );
      });
    } catch (error) {
      console.error("Failed to create the project:", error.message);
    }
  });

// Parse CLI arguments
program.parse(process.argv);
