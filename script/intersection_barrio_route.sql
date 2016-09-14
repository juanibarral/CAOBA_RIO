CREATE TABLE count_barrios_routes AS (SELECT 
	limites_barrios_wgs84.codbairro, count(*) 	
	FROM 
		limites_barrios_wgs84, all_routes_ordered WHERE ST_Intersects(limites_barrios_wgs84.geom, ST_GeomFromText(all_routes_ordered.route))
	GROUP BY 
		limites_barrios_wgs84.codbairro
	ORDER BY 
		codbairro)


