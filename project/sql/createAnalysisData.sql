Use testdb;

CREATE TABLE `analysisdata` (
  `EVENT_DATE` varchar(20) NOT NULL,
  `GRAPH_URL` varchar(100) NOT NULL,
  `EVENT_NAME` varchar(20) NULL,
  `EVENT_THUMBNAIL_URL` varchar(100) NULL,
  `EACH_BOOK_DATA` text NOT NULL,
  `VIEW_COUNT` int(11) NOT NULL,
  PRIMARY KEY (`EVENT_DATE`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;


