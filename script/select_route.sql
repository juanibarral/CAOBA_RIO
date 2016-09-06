SELECT ST_ASText(geom) as wkt FROM shapes WHERE shape_id='17337942'
--SELECT ST_AsText(ST_MakeLine(array_agg(geom ORDER BY shape_pt_s))) as wkt FROM shapes WHERE shape_id='17337942'
--SELECT * FROM all_routes WHERE shape_id='17337942'
