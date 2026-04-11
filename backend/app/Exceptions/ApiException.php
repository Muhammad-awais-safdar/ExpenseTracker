<?php

namespace App\Exceptions;

use Exception;

class ApiException extends Exception
{
    protected $statusCode;
    protected $errors;

    public function __construct($message = "An error occurred", $statusCode = 400, $errors = [])
    {
        parent::__construct($message);
        $this->statusCode = $statusCode;
        $this->errors = $errors;
    }

    public function getStatusCode()
    {
        return $this->statusCode;
    }

    public function getErrors()
    {
        return $this->errors;
    }
}
