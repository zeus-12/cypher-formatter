export const testCases = [
  `match (u:User {id: 123})
                                        WITH u
    
              MATCH (post:Post)
    WHERE post.authorId = u.id WITH u, collect(post) AS posts
                FOREACH (p IN posts |
    MERGE (u)-[:LIKED]->(p)
        FOREACH (i IN range(1, 5) |
    
    
        CREATE (u)-[:INTERACTION {count: i}]->(p)
      ))
    `,
  `
    MATCH (p:Person)-[:KNOWS]->(f:Friend)-[:LIKES]->(m:Movie)<-[:ACTED_IN]-(a:Actor)-[:ACTED_IN]->(s:Movie)
          WHERE p.age > 30
      AND f.name = 'John'
  AND m.genre IN ['Action', 'Adventure', 'Sci-Fi']
       AND a.name STARTS WITH 'C'
     
     
       AND s.year >= 2000
                 RETURN p.name, f.name, m.title, a.name, s.title
                                  ORDER BY p.name ASC, s.year DESC 
                                  LIMIT 100
    `,
];
