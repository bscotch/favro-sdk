#!/usr/bin/env node
import { program as cli } from 'commander';

// Kick it off
cli.description('CLI Name').command('subcommand', 'Do some things.').parse();
