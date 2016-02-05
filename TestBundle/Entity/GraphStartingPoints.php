<?php

namespace DueDilTask\TestBundle\Entity;

use DueDilTask\TestBundle\APIGetter;

class GraphStartingPoints
{
    protected $username_a;
    protected $username_b;

    public function getUsernameA()
    {
        return $this->username_a;
    }

    public function setUsernameA($name)
    {
        $this->username_a = $name;
    }

    public function getUsernameB()
    {
        return $this->username_b;
    }

    public function setUsernameB($name)
    {
        $this->username_b = $name;
    }

}
