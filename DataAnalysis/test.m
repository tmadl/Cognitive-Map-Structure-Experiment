files=dir('logs');
for fi=3:length(files)
    n = files(fi).name
    try
        ldata = loadjson(['logs/' n]);
    catch err
        error = 1;
        err
        continue;
    end;
    
    d = ldata.exp3;
    plotmemberships;
    
    d = ldata.exp5;
    plotmemberships;
end;