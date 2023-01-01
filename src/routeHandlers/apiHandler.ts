import { Request, Response } from "express";
import fetch from "cross-fetch";

const token = process.env.TOKEN;

const apiHandler = async (req: Request, res: Response) => {
  try {
    let query: string | { query: string } = "";
    const username = req.query.user;
    const reponame = req.query.repo;
    if (reponame)
      query = {
        query: `
            query {
              user(login: "${username}") {
                name
                login
                repository(
                  name: "${reponame}"
                ) {
                  name
                  nameWithOwner
                  description
                  isEmpty
                  defaultBranchRef{
                    target{
                        ... on Commit{
                            history(first:100){
                               totalCount
                               edges{
                                   node{
                                       additions
                                       deletions
                                   }
                               }
                            }
                         }
                      }
                  }
                  stargazers {
                      totalCount
                  }
                  forks {
                      totalCount
                  }
                  watchers {
                      totalCount
                  }
                  issues {
                      totalCount
                  }
                  pullRequests {
                      totalCount
                  }
                  languages(
                    first: 5
                    orderBy: { direction: DESC, field: SIZE }
                    ) {
                      nodes {
                          name
                          color
                      }
                  }
                }
              }
           }
           `,
      };
    else
      query = {
        query: `
            query {
              user(login: "${username}") {
                name
                login
                bio
                avatarUrl
                repositories(
                  first: 100
                  ownerAffiliations: OWNER
                  orderBy: { direction: DESC, field: STARGAZERS }
                  isFork: false
                ) {
                  totalCount
                  nodes {
                    name
                    defaultBranchRef{
                      target{
                        ... on Commit{
                            history(first:10){
                               totalCount
                               edges{
                                   node{
                                       ... on Commit{
                                           additions
                                       }
                                   }
                               }
                            }
                         }
                      }
                    }
                    languages(first: 5, orderBy: { direction: DESC, field: SIZE }) {
                      nodes {
                        name
                        color
                      }
                      edges {
                        size
                      }
                    }
                    forkCount
                    stargazerCount
                    watchers(first:1) {
                        totalCount
                    }
                    stargazers {
                      totalCount
                    }
                  }
                }
                repositoriesContributedTo(
                  first: 100
                  includeUserRepositories: false
                  orderBy: { direction: DESC, field: STARGAZERS }
                  contributionTypes: [
                    COMMIT
                    PULL_REQUEST
                    ISSUE
                    REPOSITORY
                    PULL_REQUEST_REVIEW
                  ]
                ) {
                  totalCount
                }
                pullRequests(last: 100, orderBy: {field: CREATED_AT, direction: DESC}){
                  totalCount
                  nodes{
                     additions
                  }
                }  
                issues(last: 100, orderBy: {field: CREATED_AT, direction: DESC}){
                  totalCount
                }           
              }
           }
           `,
      };
    if (username && token) {
      fetch("https://api.github.com/graphql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "bearer " + token,
        },
        body: JSON.stringify(query),
      })
        .then((resp) => resp.json())
        .then((response) => {
          res.json(response);
        })
        .catch((err) => {
          console.log(err);
          if (err.message) {
            res.send(err.message);
          } else {
            res.send(JSON.stringify(err));
          }
        });
    } else if (!username) {
      res.json({ message: "No username!" });
    } else if (!token) {
      res.json({ message: "No token!" });
    } else {
      res.json({ message: "Unknown error occured!" });
    }
  } catch (err) {
    console.log(err);
    if (err.message) {
      res.send({ message: err.message });
    } else {
      res.send({ message: JSON.stringify(err) });
    }
  }
};

export default apiHandler;
