
--CREATE TABLE all_routes AS (SELECT ST_AsText(ST_MakeLine(array_agg(ST_AsText(geom)))) as route, shape_id FROM shapes GROUP BY shape_id)
--CREATE TABLE all_routes_ordered AS (SELECT ST_AsText(ST_MakeLine(array_agg(ST_AsText(geom) ORDER BY shape_pt_s))) as route, shape_id FROM shapes GROUP BY shape_id)
(SELECT ST_AsText(ST_MakeLine(array_agg(ST_AsText(geom) ORDER BY shape_pt_s))) as route, shape_id FROM shapes GROUP BY shape_id)

