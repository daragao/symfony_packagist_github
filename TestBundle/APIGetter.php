<?php
namespace DueDilTask\TestBundle;

// static functions to get data from the Packagis and Github APIs
class APIGetter
{

    public static function getPackages($username) {
        $packagistClient = new \Packagist\Api\Client();
        //$packages = $packagistClient->search($username);
        // didn't notice much difference between multiple requests or a generic
        // search with multiple results.
        // this could be faster if I checked here if there was a path found already
        $packages = [];
        $packageNames = $packagistClient->all(array('vendor' => $username));
        foreach ($packageNames as $name) {
            array_push($packages,$packagistClient->get($name));
        }
        return $packages;
    }

    //missing all the repos that a user contributed to!
    //a user might have contributed to a repository, but not be the owner of the repository
    // this fails if the first user searched is in that case
    public static function getGithubContributors($owner,$reponame) {
        $PASSWORD = '';
        $username = '';

        $page = 1;
        $base_url = 'https://api.github.com';
        $url = '/repos/'.$owner.'/'.$reponame.'/contributors?per_page=100&page=';

        // this could be done async, and having websockets on the frontend
        // create curl resource
        $goToNextPage = True;
        $contributors = array();
        // get all the pages
        do {
            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, $base_url.$url.$page);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
            curl_setopt($ch,CURLOPT_HEADER, true);
            curl_setopt($ch, CURLOPT_USERPWD, $username . ":" . $PASSWORD);
            $user_agent = "Mozilla/5.0 (Windows; U; Windows NT 5.1;".
                " en-GB; rv:1.8.1.6) Gecko/20070725 Firefox/2.0.0.6";
            curl_setopt($ch,CURLOPT_USERAGENT,$user_agent);
            $output = curl_exec($ch);
            $header_size = curl_getinfo($ch, CURLINFO_HEADER_SIZE);
            curl_close($ch);

            $header = substr($output, 0, $header_size);
            $body = substr($output, $header_size);
            $json = json_decode($body,true);

            $contributors = array_merge($contributors,$json);
            ++$page;
            $goToNextPage = (count($json) > 99);
        } while($goToNextPage);
        return $contributors;
    }
}
