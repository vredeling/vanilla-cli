<?php
/**
 * @copyright 2009-2017 Vanilla Forums Inc.
 * @license MIT
 */

namespace Vanilla\Cli\Command;

use \Garden\Cli\Cli;
use \Garden\Cli\Args;
use Vanilla\Cli\CliUtil;

/**
 * Class Command
 *
 * @package Vanilla\Cli\Command
 */
class Command {

    /** @var string */
    protected $vanillaSrcDir;

    /** @var bool */
    protected $isVerbose;

    /**
     * Command constructor.
     *
     * @param Cli $cli
     */
    public function __construct(Cli $cli) {
        $cli
            ->command($this->getName())
            ->opt(
                'vanillasrc',
                'Vanilla source folder. This parameter can be skipped if you set VANILLACLI_VANILLA_SRC_DIR in your environment variables.'
            )
            ->opt('verbose:v', 'Show additional output.', false, 'bool')
        ;
    }

    /**
     * Return the name of the command.
     *
     * @return string
     */
    public function getName() {
        // Convert "\Namespace\SomeCommandNameCmd" to "some-command-name"
        $className = str_replace(__NAMESPACE__.'\\', '', static::class);
        $commandName = preg_replace('/cmd$/i', '', $className);
        $commandName = preg_replace('/([A-Z])/', '-$1', $commandName);
        $commandName = strtolower(ltrim($commandName, '-'));

        return $commandName;
    }

    /**
     * Command's execution function.
     *
     * This base command class has some common setup, so be sure to call parent::run($args);
     *
     * @param Args $args
     *
     * @return mixed
     */
    public function run(Args $args) {
        $this->isVerbose = $args->getOpt('verbose') ?: false;
        $potentialSrcDirectory = $args->getOpt('vanillasrc', getenv('VANILLACLI_VANILLA_SRC_DIR'));

        if (!$potentialSrcDirectory) {
            CliUtil::error('Vanilla source directory is missing.');
        }

        if (!is_dir($potentialSrcDirectory)) {
            CliUtil::error('Vanilla source directory is not a valid directory.');
        }

        $this->vanillaSrcDir = realpath($potentialSrcDirectory);
    }
}
