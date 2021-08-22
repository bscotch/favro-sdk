#!/usr/bin/env node
import { program as cli } from 'commander';
// import { BravoClient } from '$/lib/BravoClient.js';

// Kick it off
cli
  .description('Bravo CLI: organizations')
  .option('--list', 'List all organizations')
  .option('--find-by-name', 'Find a specific organization')
  .parse();

// // Sample user options available via:
// const options = cli.opts();

// const client = new BravoClient();
