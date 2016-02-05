<?php

namespace DueDilTask\TestBundle\Form;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;

class GraphStartingPointsType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder->add('username_a');
        $builder->add('username_b');
    }

    public function getName()
    {
        return 'graph_starting_points';
    }
}
