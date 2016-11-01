-- mike may, 29-Oct-2016
-- mysql
drop database quotes;
create database quotes;

use quotes;

create table stocks {
    stock_id int auto_increment
    , ticker varchar(10) not null
    , last_quote int not null
    ,primary key(stock_id)
};

insert into stocks(ticker, last_quote) values('AAPL', 0);
insert into stocks(ticker, last_quote) values('MSFT', 0);
insert into stocks(ticker, last_quote) values('GOOG', 0);
insert into stocks(ticker, last_quote) values('FB', 0);

create table quotes (
  quote_id int AUTO_INCREMENT
  ,stock varchar(10) not null
  ,time_indicator long not null
  ,price decimal(12,5) not NULL
  ,volume long not null
  ,stock_id int
  ,PRIMARY KEY(quote_id)
);
--
-- don't know how to give it a relative path otherwise csv
-- files must be copied to <mysql>/var/quotes which complicates drop database
load data infile '~/projects/server/data/aapl.csv'
  into table quotes fields TERMINATED BY ','
  (stock, time_indicator, price, volume)
  set quote_id = null, stock_id = null;
load data infile '~/projects/server/data/msft.csv'
  into table quotes fields TERMINATED BY ','
  (stock, time_indicator, price, volume)
  set quote_id = null, stock_id = null;
load data infile '~/projects/server/data/goog.csv'
  into table quotes fields TERMINATED BY ','
  (stock, time_indicator, price, volume)
  set quote_id = null, stock_id = null;
load data infile '~/projects/server/data/fb.csv'
  into table quotes fields TERMINATED BY ','
  (stock, time_indicator, price, volume)
  set quote_id = null, stock_id = null;

update quotes set stock_id = (select stock_id from stocks where stocks.ticker = quotes.stock);


alter table quotes drop column stock;

alter table quotes (
    add constraint(stock_fk) foreign key
    stock_idx (stock_id)
    references stocks(stock_id)
);


create table last_quote (
  last_quote int not null
);

insert into last_quote(last_quote_id, last_quote) values(0);

drop user quoter@localhost;
create user quoter@localhost identified by 'thisusercando_nothing!!';
grant select on quotes to quoter@localhost;
grant update, select on last_quote to quoter@localhost;