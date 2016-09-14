SELECT 
	all_routes_ordered.route
FROM 
	limites_barrios_wgs84, all_routes_ordered
WHERE 
	limites_barrios_wgs84.codbairro = '114' 
AND 
	ST_Intersects(limites_barrios_wgs84.geom, ST_GeomFromText(all_routes_ordered.route))