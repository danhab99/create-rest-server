#!/usr/bin/env node
const { program } = require('commander');
const chalk = require('chalk');
const { Spinner } = require('cli-spinner');
const fs = require('fs')
const { spawn } = require('child_process')
const fse = require('fs-extra');

var initDirectory = ''

program
  .arguments('<dir>')
  .description('Command for creating a dockerized mongo express server', {
    dir: 'The directory to initalize in'
  })
  .action(dir => {
    initDirectory = dir
  })

program.parse(process.argv)

const info = (msg, ...args) => console.log(chalk.cyanBright(`\n${msg}\n`), ...args)
const warn = (msg, ...args) => console.log(chalk.yellowBright(`\n${msg}\n`), ...args)
const success = (msg, ...args) => console.log(chalk.greenBright(`\n${msg}\n`), ...args)
const error = (msg, ...args) => console.log(chalk.redBright(`\n${msg}\n`), ...args)

const doWork = (start, work, end, err) => {
  var spin = new Spinner({
    text: `${chalk.cyanBright(start)}.. %s`,
    stream: doWork.stderr,
    onTick: function (msg) {
      this.clearLine(this.stream);
      this.stream.write(msg);
    },
  });

  spin.start()

  return new Promise(async (resolve, reject) => work(resolve, reject))
    .then((r) => {
      spin.stop()
      success(end)
      return r
    })
    .catch((e) => {
      error(err, e)
      process.exit(1)
    })
}

(async () => {  
  await doWork(
    'Adding repo files',
    done => fse.copy(__dirname + '/templateRepo', initDirectory).then(done),
    'Done!',
    'Cannot add files'
  )

  await doWork(
    'Installing dependencies',
    done => {
      let child = spawn('npm', ['install'], { cwd: initDirectory })
      child.stdout.pipe(process.stderr)
      child.on('exit', done)
    },
    'Installed all dependencies',
    'Unable to install dependencies'
  )
  
  success(`Your project is ready. Type cd ${initDirectory} and get to work!`)
})()

