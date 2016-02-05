<?php

namespace DueDilTask\TestBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Session;

use DueDilTask\TestBundle\Entity\GraphStartingPoints;
use DueDilTask\TestBundle\Form\GraphStartingPointsType;

use Symfony\Component\HttpFoundation\Response;
use DueDilTask\TestBundle\GraphMaker;

class DefaultController extends Controller
{
    public function indexAction($name)
    {
        return $this->render('DueDilTaskTestBundle:Default:index.html.twig', array('name' => $name));
    }

    protected function jsonResponse($obj) {
        $response = new Response(json_encode($obj));
        $response->headers->set('Content-Type', 'application/json');
        return $response;
    }

    //get all nodes
    public function getNodesAction() {
        $session  = $this->get("session");
        $graphMaker = $session->get("graphMaker");
        $graph = $graphMaker->getNodes();
        return $this->jsonResponse($graph);
    }

    // add a new node, if node is already added just returns the current graph
    public function addNodeUsernameAction($username) {
        $session  = $this->get("session");
        $graphMaker = $session->get("graphMaker");
        $nodeArray = $graphMaker->addNode($username);
        $graph = $graphMaker->getNodes();
        // save GraphMaker obj to session (maybe don't need to do it here)
        $session->set("graphMaker",$graphMaker);

        return $this->jsonResponse($graph);
    }

    // start a new graph
    public function graphDistanceAction()
    {
        $graphStartingPoints = new GraphStartingPoints();
        $form = $this->createForm(new GraphStartingPointsType(), $graphStartingPoints);

        $request = $this->getRequest();
        if ($request->getMethod() == 'POST') {
            $form->bind($request);

            if ($form->isValid()) {

                $usernameA = $graphStartingPoints->getUsernameA();
                $usernameB = $graphStartingPoints->getUsernameB();

                $graphMaker = new GraphMaker($usernameA,$usernameB);
                $graphMaker->createNewGraph();
                $graph = $graphMaker->getNodes();

                // save GraphMaker obj to session
                $session  = $this->get("session");
                $session->set("graphMaker",$graphMaker);

                return $this->jsonResponse($graph);
                //return $this->redirect($this->generateUrl('due_dil_task_test_homepage',array('name'=>'test')));
            }
        }

        return $this->render('DueDilTaskTestBundle:Default:distance.html.twig', array(
            'form' => $form->createView()
        ));
    }
}
