#!/usr/bin/env node
import { program as cli } from 'commander';

// Kick it off
cli
  .description('Bravo CLI: Talk to Favro from the command line!')
  .command('organizations', 'Get organization info.')
  .command('collections', 'Find and create collections.')
  .command('widgets', 'Create, view, and delete Widgets (a.k.a. "Boards").')
  .command('cards', 'Create, view, and delete Cards.')
  .parse();

// TODO: Add common fields for credentials, plus env file loading
