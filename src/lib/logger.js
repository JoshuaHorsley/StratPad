

// Colour list 
const COLOURS =
{

    BLACK: '\x1b[30m',      // currently unused 
    RED: '\x1b[31m',        // error messages 
    YELLOW: '\x1b[33m',     // caution messages 
    GREEN: '\x1b[32m',      // success message 
    BLUE: '\x1b[36m',       // info messages 
    PURPLE: '\x1b[35m',     // debug messages 
    WHITE: '\x1b[37m',      // currently unused 
    RESET: '\x1b[0m'        // resets log colour to default (black) 

};



// CLASS:       Logger
// DESCRIPTION: A flexible logging utility that supports multiple log levels, context, and file writing for server-side applications. It is designed to be used throughout the application for consistent logging practices.
class Logger
{


    // FUNCTION:    constructor
    // PARAMETERS:  context (string) - Optional context for the logger (e.g., 'Auth', 'Database')
    // RETURNS:     None
    // DESCRIPTION: Initializes the logger with an optional context and determines if the environment is development or production.
    constructor(context = 'App')
    {

        this.context = context;                                             // Context for log messages to indicate the source of the log (e.g., 'Auth', 'Database')
        this.developmentPhaseFlag = process.env.NODE_ENV === 'development'; // Check if the environment is development or production to decide logging behavior 

    }



    // FUNCTION:    getTimestamp
    // PARAMETERS:  None
    // RETURNS:     string - Current timestamp in ISO format
    // DESCRIPTION: Generates a timestamp for log messages to provide temporal context.
    getTimestamp() {

        return new Date().toISOString(); // ISO format for consistent timestamp formatting

    }



    // FUNCTION:    formatMessage
    // PARAMETERS:  level (string) - Log level (e.g., 'info', 'error')
    //              message (string) - The log message
    //              data (object) - Optional additional data to include in the log
    // RETURNS:     string - Formatted log message with timestamp, level, context, and data
    // DESCRIPTION: Formats the log message by including the timestamp, log level, context, and any additional data desired.
    formatMessage(level, message, data = null)
    {

        // Get current time
        const timestamp = this.getTimestamp();

        // define context variable 
        let contextText = '';

        // If context is provided, include it in the log message
        if (this.context)
        {

            contextText = '[' + this.context + ']';

        }

        // extra data for the message
        let dataText = '';

        // If additional data is provided, format it as a JSON string 
        if (data !== null)
        {

            dataText = '\n' + JSON.stringify(data, null, 2);

        }

        // Build final log message
        let finalMessage = timestamp + ' ' +
            level.toUpperCase() + ' ' +
            contextText + ': ' +
            message +
            dataText;

        return finalMessage;

    }



    // FUNCTION:    infoLog
    // PARAMETERS:  message (string) - The log message
    //              data (object) - Optional additional data to include in the log
    // RETURNS:     None
    // DESCRIPTION: Logs an informational message in blue to the console and writes it to a file if not in development mode. 
    //              This is used for general information about the application's operation.
    infoLog(message, data = null)
    {

        // Format the message
        let formattedMessage = this.formatMessage('info', message, data);

        // Print to console in blue
        console.log(COLOURS.BLUE + formattedMessage + COLOURS.RESET);

        // Write to file if not in development mode
        if (this.developmentPhaseFlag === false)
        {

            this.writeToFile('info', formattedMessage);

        }

    }



    // FUNCTION:    successLog
    // PARAMETERS:  message (string) - The log message
    //              data (object) - Optional additional data to include in the log
    // RETURNS:     None
    // DESCRIPTION: Logs a success message in green to the console and optionally writes it to a file if not in development mode. 
    //              This is used for successful operations or milestones in the application.
    successLog(message, data = null)
    {

        // Format the message
        let formattedMessage = this.formatMessage('success', message, data);

        // Print to console in green
        console.log(COLOURS.GREEN + formattedMessage + COLOURS.RESET);

        // Write to file if not in development mode
        if (this.developmentPhaseFlag === false)
        {

            this.writeToFile('success', formattedMessage);

        }

    }


    // FUNCTION:    warnLog
    // PARAMETERS:  message (string) - The log message
    //              data (object) - Optional additional data to include in the log
    // RETURNS:     None
    // DESCRIPTION: Logs a warning message to the console and optionally writes it to a file if not in development mode. 
    //              This is used for potential issues or important notices that do not necessarily indicate an error.
    warnLog(message, data = null)
    {

        // Format the message
        let formattedMessage = this.formatMessage('warn', message, data);

        // Print to console in yellow
        console.warn(COLOURS.YELLOW + formattedMessage + COLOURS.RESET);

        // Write to file if not in development mode
        if (this.developmentPhaseFlag === false)
        {

            this.writeToFile('warn', formattedMessage);

        }

    }


    // FUNCTION:    errorLog
    // PARAMETERS:  message (string) - The log message
    //              error (Error) - Optional error object to include in the log
    // RETURNS:     None
    // DESCRIPTION: Logs an error message to the console with red color and optionally writes it to a file if not in development mode. 
    //              This is used for logging errors and exceptions, including stack traces and error details when available.
    errorLog(message, error = null)
    {

        // Build error data object
        let errorData = null;

        // If an error object is provided, pull out message and stack trace
        if (error !== null)
        {

            errorData =
            {

                message: error.message,
                stack: error.stack

            };

        }

        // Format the message
        let formattedMessage = this.formatMessage('error', message, errorData);

        // Print to console in red
        console.error(COLOURS.RED + formattedMessage + COLOURS.RESET);

        // Write to file if not in development mode
        if (this.developmentPhaseFlag === false) {

            this.writeToFile('error', formattedMessage);

        }

    }


    // FUNCTION:    debugLog
    // PARAMETERS:  message (string) - The log message
    //              data (object) - Optional additional data to include in the log
    // RETURNS:     None
    // DESCRIPTION: Logs a debug message to the console with purple color. 
    //              This is used for detailed debugging information that is typically only relevant during development and is not written to files in production.
    debugLog(message, data = null)
    {

        // Only log debug messages in development mode
        if (this.developmentPhaseFlag === true)
        {

            // Format the message
            let formattedMessage = this.formatMessage('debug', message, data);

            // Print to console in purple
            console.log(COLOURS.PURPLE + formattedMessage + COLOURS.RESET);

        }

    }


    // FUNCTION:    writeToFile
    // PARAMETERS:  level (string) - Log level to determine the log file name
    //              message (string) - The log message to write to the file
    // RETURNS:     None
    // DESCRIPTION: Writes the log message to a file on the server-side. It creates a 'logs' directory if it doesn't exist and appends the log message to a file named after the log level (e.g., 'info.log', 'error.log'). 
    //              This function is designed to work only in a Node.js environment and will silently fail if file writing is not possible.
    writeToFile(level, message) {

        // Only works on server-side, not in browser
        if (typeof window === 'undefined')
        {

            try
            {

                const fs = require('fs');       // Node.js file system module for writing logs to files
                const path = require('path');   // Node.js path module for handling file paths

                const logDir = path.join(process.cwd(), 'logs');    // Directory for log files
                const logFile = path.join(logDir, `${level}.log`);  // Log file name based on log level (e.g., 'info.log', 'error.log')

                // Create logs directory if it doesn't exist
                if (!fs.existsSync(logDir)) {

                    fs.mkdirSync(logDir, { recursive: true });

                }

                // Append to log file
                fs.appendFileSync(logFile, message + '\n');

            }
            catch (err)
            {

                // Fail message if file writing doesn't work
                console.error('Failed to write log to file:', err);

            }
        }
    }

    // FUNCTION:    childBirth
    // PARAMETERS:  context (string) - The context for the child logger (e.g., 'Auth', 'Database')
    // RETURNS:     Logger - A new Logger instance with the specified context
    // DESCRIPTION: Creates a child logger with a specific context. 
    //              This allows for more specific logging in different parts of the app 
    childBirth(context)
    {

        return new Logger(context);

    }

}



// Create and export default logger instance
const logger = new Logger();
export default logger;