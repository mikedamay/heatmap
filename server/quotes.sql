drop database quotes;
create database quotes;

use quotes;

create table quotes (
  quote_id int AUTO_INCREMENT
  ,stock varchar(10) not null
  ,time_indicator long not null
  ,price decimal(12,5) not NULL
  ,volume long not null
  ,PRIMARY KEY(quote_id)
);
--
-- don't know how to give it a relative path otherwise csv
-- files must be copied to <mysql>/var/quotes which complicates drop database
load data infile '~/projects/server/aapl.csv' into table quotes fields TERMINATED BY ','
  (stock, time_indicator, price, volume)
  set quote_id = null;

create table last_quote (
  last_quote_id tinyint not null
  ,last_quote int not null
  ,primary key(last_quote_id)
);

insert into last_quote(last_quote_id, last_quote) values(1,0);

drop user quoter@localhost;
create user quoter@localhost identified by 'thisusercando_nothing!!';
grant select on quotes to quoter@localhost;
grant update, select on last_quote to quoter@localhost;