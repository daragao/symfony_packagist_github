<?php
namespace DueDilTask\TestBundle;

// manages a structure which represents a graph with a node (packagist package
//  name) and its neighbours (github contributors to that package)
class GraphMaker
{

    protected $username_a;//endpoints of the path username
    protected $username_b;//
    protected $users_requested_array;//avoids making the same request 2x
    protected $result_array;// current graph structure

    function __construct($username_a,$username_b) {
        $this->username_a = $username_a;
        $this->username_b = $username_b;
        $this->init();
    }

    protected function init() {
        $this->users_requested_array = array();
        $this->result_array = array();
    }

    protected function makeNode($package) {
        $packageName = $package->getName();
        $packageRepoName = $package->getRepository();

        preg_match('`^([^/]+)/(.*)$`', $packageName, $matches);
        $packageUsername=$matches[1];
        $packageRepository=$matches[2];

        //get user and repository from github url
        // parse url for repo name and owner
        if(preg_match('`/([^/]+)/([^/]*/?)$`', $packageRepoName, $matches))
        {
            $owner=$matches[1];
            $reponame=$matches[2];

            //remove .git at the end of some urls
            $pattern = '/(.+)(.git)/i';
            $replacement = '${1}';
            $reponame = preg_replace($pattern, $replacement, $reponame);

            //get contributors of this package
            $contributors = [];
            $github = APIGetter::getGithubContributors($owner,$reponame);
            //add the package username and owner, because it allows to have a
            //reference
            array_push($contributors,$packageUsername);
            array_push($contributors,$owner);
            // add contributor to this package
            foreach ($github as $githubContributor) {
                //if there is an error message that user is ignored
                if(is_array($githubContributor) &&
                    array_key_exists("login",$githubContributor))
                    array_push($contributors,$githubContributor["login"]);
            }

            //node structure
            $node = array(
                //'packagist_package' => $package,
                //'github_collaborators' => $github,
                'packagist_name'=> $packageName,
                //'packagist_username'=> $packageUsername,
                //'packagist_repository'=> $packageRepository,
                //'github_repository_owner' => $owner,
                //'github_repository' => $reponame,
                //'repository_url' => $packageRepoName,
                'contributors' => $contributors
            );

            return $node;
        }
        else
        {
            return null;
        }
    }

    // create a node with the package name and its neighbours (github login names)
    protected function createNodeArray($username) {

        //get packagist package
        $packages = APIGetter::getPackages($username);
        $result = [];
        //loop through all the packages
        foreach ($packages as $package) {
            //only make new nodes that don't exist yet
            $packName = $package->getName();
            if(!array_key_exists($packName,$this->result_array)) {
                $node = $this->makeNode($package);
                if($node)
                    array_push($result,$node);
                // here I  could re check to see if there is any path available
            }
        }

        array_push($this->users_requested_array,$username);
        return $result;
    }

    //add array of nodes found to result array
    protected function addNodeToResult($nodeArray) {
        foreach ($nodeArray as $node) {
            $packName = $node['packagist_name'];
            if(!array_key_exists($packName,$this->result_array)) {
                $this->result_array[$packName] = $node;
            }
        }
    }

    // creates a totally new graph
    public function createNewGraph()
    {
        // I am assuming that the packagist repo vendor, and the github login
        // are the same
        $this->init();
        $this->addNode($this->username_a);
        $this->addNode($this->username_b);
    }

    // add node array to current graph
    public function addNode($username) {
        //only search users that we haven't searched yet
        if(in_array($username,$this->users_requested_array))
            return;
        $nodeArray = $this->createNodeArray($username);
        $this->addNodeToResult($nodeArray);
        return $nodeArray;//returns new nodes
    }

    public function getNodes() {
        return $this->result_array;
    }
}
